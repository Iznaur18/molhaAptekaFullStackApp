import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { ProductModel } from "../models/index.js";
import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import {
  approveProductViaApi,
  buildOrderBody,
  buildTestProductPayload,
  createProductViaApi,
  ensureProductCategoryTreeSeeded,
  parseErrorMessage,
  parseSuccessData,
  registerUserAndGetCookie,
  setUserRole,
  verifyUserEmail,
} from "./helpers/integrationTestHelpers.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";
process.env.NODE_ENV = "test";

/** @type {import('node:http').Server | null} */
let server = null;
/** @type {(path: string, init?: RequestInit) => Promise<Response>} */
let request = async () => new Response();

before(async () => {
  await connectMongoTestReplSet();
  const testServer = await startHttpTestServer();
  server = testServer.server;
  request = testServer.request;
});

afterEach(async () => {
  await clearMongoCollections();
});

after(async () => {
  if (server) {
    await stopHttpTestServer(server);
  }
  await disconnectMongoTestReplSet();
});

const MOSCOW_POINT = {
  address: "Москва, Тверская улица, д 1",
  lat: 55.757,
  lon: 37.615,
  isDefault: true,
};

/**
 * @param {string} cookie
 * @param {Record<string, unknown>} [overrides]
 */
const putDefaults = (cookie, overrides = {}) =>
  request("/sellers/commerce-defaults", {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      pickupLocations: [MOSCOW_POINT],
      pickupEnabled: true,
      deliveryCarrier: "",
      paymentMethods: ["cashOnDelivery", "cardOnDelivery"],
      // DaData в тестах не настроена — регион приходит с клиента, как и
      // в бою, когда адрес выбран из подсказки.
      regionCode: "RU-MOW",
      ...overrides,
    }),
  });

test("настройки продавца: PUT → GET возвращает сохранённое", async () => {
  const { cookie } = await registerUserAndGetCookie(request, "defaults-rt");

  const saved = await parseSuccessData(await putDefaults(cookie));
  assert.equal(saved.defaults.fulfillmentConfigured, true);
  assert.equal(saved.defaults.pickupLocations.length, 1);
  assert.deepEqual(saved.defaults.paymentMethods, [
    "cashOnDelivery",
    "cardOnDelivery",
  ]);

  const read = await parseSuccessData(
    await request("/sellers/commerce-defaults/me", { headers: { Cookie: cookie } }),
  );
  assert.equal(read.defaults.pickupLocations[0].address, MOSCOW_POINT.address);
  assert.equal(read.defaults.followingProductCount, 0);
});

test("тариф своей доставки сохраняется и возвращается", async () => {
  const { cookie } = await registerUserAndGetCookie(request, "defaults-tariff");

  const saved = await parseSuccessData(
    await putDefaults(cookie, {
      deliveryCarrier: "seller",
      deliveryTariff: {
        paid: true,
        baseFeeRub: 200,
        perKmRub: 30,
        freeFromRub: 5000,
      },
    }),
  );

  assert.equal(saved.defaults.deliveryTariff.paid, true);
  assert.equal(saved.defaults.deliveryTariff.baseFeeRub, 200);
  assert.equal(saved.defaults.deliveryTariff.perKmRub, 30);
  assert.equal(saved.defaults.deliveryTariff.freeFromRub, 5000);

  const read = await parseSuccessData(
    await request("/sellers/commerce-defaults/me", { headers: { Cookie: cookie } }),
  );
  assert.equal(read.defaults.deliveryTariff.baseFeeRub, 200);
});

test("платный тариф с курьерами Gitorg → 400", async () => {
  const { cookie } = await registerUserAndGetCookie(request, "defaults-tariff-bad");

  const response = await putDefaults(cookie, {
    deliveryCarrier: "gitorg_courier",
    deliveryTariff: { paid: true, baseFeeRub: 200, perKmRub: 0, freeFromRub: 0 },
  });

  assert.equal(response.status, 400);
});

test("смена перевозчика гасит тариф", async () => {
  const { cookie } = await registerUserAndGetCookie(request, "defaults-tariff-off");

  await putDefaults(cookie, {
    deliveryCarrier: "seller",
    deliveryTariff: { paid: true, baseFeeRub: 200, perKmRub: 0, freeFromRub: 0 },
  });
  // Возврат к самовывозу без доставки: цены не должны ожить при следующем
  // включении своей доставки.
  const saved = await parseSuccessData(
    await putDefaults(cookie, { deliveryCarrier: "" }),
  );

  assert.equal(saved.defaults.deliveryTariff.paid, false);
  assert.equal(saved.defaults.deliveryTariff.baseFeeRub, 0);
});

test("настройки продавца: без единого способа получения → 400", async () => {
  const { cookie } = await registerUserAndGetCookie(request, "defaults-none");
  const response = await putDefaults(cookie, {
    pickupEnabled: false,
    deliveryCarrier: "",
  });
  assert.equal(response.status, 400);
});

test("настройки продавца: без единого способа оплаты → 400", async () => {
  const { cookie } = await registerUserAndGetCookie(request, "defaults-nopay");
  const response = await putDefaults(cookie, { paymentMethods: [] });
  assert.equal(response.status, 400);
});

test("товар по профилю создаётся без адреса в теле", async () => {
  await ensureProductCategoryTreeSeeded();
  const { cookie } = await registerUserAndGetCookie(request, "seller-profile-src");
  await verifyUserEmail("int-seller-profile-src@example.com");
  // Профиль с доставкой продавцом и выключенным самовывозом: так видно, что
  // товар берёт из профиля ВСЁ, а не только строку адреса.
  await putDefaults(cookie, { pickupEnabled: false, deliveryCarrier: "seller" });

  const payload = buildTestProductPayload({ productFulfillmentSource: "profile" });
  // Профиль и собственный адрес вместе схема отклоняет — шлём только источник.
  delete payload.productPickupAddress;
  delete payload.productPickupLat;
  delete payload.productPickupLon;
  delete payload.productDeliveryEnabled;

  const response = await request("/product", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(payload),
  });
  assert.ok(response.status === 200 || response.status === 201, `${response.status}`);
  const { product } = await parseSuccessData(response);

  const stored = await ProductModel.findById(product._id).lean();
  assert.equal(stored.productFulfillmentSource, "profile");
  assert.equal(stored.productPickupAddress, MOSCOW_POINT.address);
  assert.equal(stored.productPickupLat, MOSCOW_POINT.lat);
  assert.equal(stored.productPickupLon, MOSCOW_POINT.lon);
  assert.deepEqual(stored.productPickupLocation.coordinates, [
    MOSCOW_POINT.lon,
    MOSCOW_POINT.lat,
  ]);
  // Мультиточки, регион и перевозчик тоже из профиля: по первым двум ищет
  // каталог, по третьему собирается отправление.
  assert.equal(stored.productPickupLocations.length, 1);
  assert.equal(stored.productPickupLocations[0].address, MOSCOW_POINT.address);
  assert.equal(stored.productRegionCode, "RU-MOW");
  assert.equal(stored.productPickupEnabled, false);
  assert.equal(stored.productDeliveryCarrier, "seller");
  assert.equal(stored.productDeliveryEnabled, true);
});

test("товар по профилю без настроек в профиле → 400", async () => {
  await ensureProductCategoryTreeSeeded();
  const { cookie } = await registerUserAndGetCookie(request, "seller-no-profile");
  await verifyUserEmail("int-seller-no-profile@example.com");

  const payload = buildTestProductPayload({ productFulfillmentSource: "profile" });
  delete payload.productPickupAddress;
  delete payload.productPickupLat;
  delete payload.productPickupLon;
  delete payload.productDeliveryEnabled;

  const response = await request("/product", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(payload),
  });
  assert.equal(response.status, 400);
});

test("заказ способом оплаты, который продавец не принимает → 400", async () => {
  await ensureProductCategoryTreeSeeded();

  const { cookie: sellerCookie } = await registerUserAndGetCookie(
    request,
    "seller-pay-guard",
  );
  await verifyUserEmail("int-seller-pay-guard@example.com");
  // Продавец принимает только перевод при получении.
  await putDefaults(sellerCookie, { paymentMethods: ["cardOnDelivery"] });

  const product = await createProductViaApi(request, sellerCookie, {
    productName: "Payment Guard Product",
  });

  const { cookie: modCookie, user: modUser } = await registerUserAndGetCookie(
    request,
    "mod-pay-guard",
  );
  await setUserRole(modUser._id, "moderator");
  await approveProductViaApi(request, modCookie, String(product._id));

  const { cookie: buyerCookie } = await registerUserAndGetCookie(
    request,
    "buyer-pay-guard",
  );
  await verifyUserEmail("int-buyer-pay-guard@example.com");

  // buildOrderBody шлёт наличные — их продавец не принимает.
  const rejected = await request("/order", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: buyerCookie },
    body: JSON.stringify(buildOrderBody(String(product._id))),
  });
  assert.equal(rejected.status, 400);
  assert.match(await parseErrorMessage(rejected), /не принимает/i);

  const accepted = await request("/order", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: buyerCookie },
    body: JSON.stringify({
      ...buildOrderBody(String(product._id)),
      paymentMethod: "cardOnDelivery",
    }),
  });
  const orderData = await parseSuccessData(accepted);
  assert.ok(orderData.order?._id);
});
