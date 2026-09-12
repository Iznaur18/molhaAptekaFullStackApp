import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { OrderModel } from "../models/index.js";
import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import {
  approveProductViaApi,
  buildOrderBody,
  buildTestProductPayload,
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

const REAL_FETCH = globalThis.fetch;

/** @type {import('node:http').Server | null} */
let server = null;
/** @type {(path: string, init?: RequestInit) => Promise<Response>} */
let request = async () => new Response();

const WAREHOUSE = {
  address: "Москва, Тверская улица, д 1",
  lat: 55.757,
  lon: 37.615,
  isDefault: true,
};

/** Где «нашёлся» адрес покупателя в OSM. */
const BUYER_POINT = { lat: 55.7648, lon: 37.6055 };

const TARIFF = { paid: true, baseFeeRub: 200, perKmRub: 30, freeFromRub: 0 };

/** @type {string[]} */
let geoCalls = [];

/**
 * Внешние геосервисы — заглушки, всё остальное (сам тестовый сервер) — как есть.
 *
 * @param {{ routeMeters: number; buyerFound?: boolean }} options
 */
const stubGeoServices = ({ routeMeters, buyerFound = true }) => {
  process.env.GEO_EXTERNAL_TEST = "1";
  process.env.GEO_NOMINATIM_INTERVAL_MS = "0";
  globalThis.fetch = async (input, init) => {
    const url = new URL(typeof input === "string" ? input : String(input.url ?? input));
    const json = (body) =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    if (url.host.includes("nominatim")) {
      geoCalls.push("nominatim");
      return json(
        buyerFound
          ? [
              {
                lat: String(BUYER_POINT.lat),
                lon: String(BUYER_POINT.lon),
                place_rank: 30,
              },
            ]
          : [],
      );
    }
    if (url.host.includes("photon")) {
      geoCalls.push("photon");
      return json({ features: [] });
    }
    if (url.pathname.includes("/route")) {
      geoCalls.push("route");
      return json({ code: "Ok", routes: [{ distance: routeMeters }], waypoints: [] });
    }
    return REAL_FETCH(input, init);
  };
};

before(async () => {
  await connectMongoTestReplSet();
  const testServer = await startHttpTestServer();
  server = testServer.server;
  request = testServer.request;
});

afterEach(async () => {
  globalThis.fetch = REAL_FETCH;
  delete process.env.GEO_EXTERNAL_TEST;
  delete process.env.GEO_NOMINATIM_INTERVAL_MS;
  geoCalls = [];
  await clearMongoCollections();
});

after(async () => {
  if (server) {
    await stopHttpTestServer(server);
  }
  await disconnectMongoTestReplSet();
});

/**
 * Продавец с платной своей доставкой, одобренный товар по профилю и покупатель.
 *
 * @param {string} suffix
 */
const setupSellerDelivery = async (suffix) => {
  await ensureProductCategoryTreeSeeded();
  const { cookie: sellerCookie } = await registerUserAndGetCookie(
    request,
    `sd-s-${suffix}`,
  );
  await verifyUserEmail(`int-sd-s-${suffix}@example.com`);

  const defaults = await request("/sellers/commerce-defaults", {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: sellerCookie },
    body: JSON.stringify({
      pickupLocations: [WAREHOUSE],
      pickupEnabled: true,
      deliveryCarrier: "seller",
      paymentMethods: ["cashOnDelivery", "cardOnDelivery"],
      regionCode: "RU-MOW",
      deliveryTariff: TARIFF,
    }),
  });
  await parseSuccessData(defaults);

  const payload = buildTestProductPayload({
    productName: `Доставка продавцом ${suffix}`,
    productFulfillmentSource: "profile",
  });
  delete payload.productPickupAddress;
  delete payload.productPickupLat;
  delete payload.productPickupLon;
  delete payload.productDeliveryEnabled;
  const created = await request("/product", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sellerCookie },
    body: JSON.stringify(payload),
  });
  const { product } = await parseSuccessData(created);

  const { cookie: modCookie, user: modUser } = await registerUserAndGetCookie(
    request,
    `sd-m-${suffix}`,
  );
  await setUserRole(modUser._id, "moderator");
  await approveProductViaApi(request, modCookie, String(product._id));

  const { cookie: buyerCookie } = await registerUserAndGetCookie(
    request,
    `sd-b-${suffix}`,
  );
  await verifyUserEmail(`int-sd-b-${suffix}@example.com`);

  return { productId: String(product._id), buyerCookie };
};

/**
 * @param {string} cookie
 * @param {Record<string, unknown>} body
 */
const postQuote = (cookie, body) =>
  request("/order/seller-delivery-quote", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(body),
  });

test("котировка в корзине и сумма в заказе совпадают — по дорогам", async () => {
  const { productId, buyerCookie } = await setupSellerDelivery("match");
  stubGeoServices({ routeMeters: 2_400 });

  const address = { deliveryAddress: "Москва, Тверская 7", deliveryAddressFlat: "1" };
  const quote = await parseSuccessData(
    await postQuote(buyerCookie, {
      productIds: [productId],
      ...address,
      // Клиент прислал точку у самого склада — километраж это не обнулит.
      deliveryAddressGeo: { lat: WAREHOUSE.lat, lon: WAREHOUSE.lon },
    }),
  );
  assert.equal(quote.sellers.length, 1);
  assert.equal(quote.sellers[0].distanceKm, 2.4);
  assert.equal(quote.sellers[0].distanceSource, "road");
  assert.equal(quote.sellers[0].tariff.perKmRub, 30);

  const created = await request("/order", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: buyerCookie },
    body: JSON.stringify({
      ...buildOrderBody(productId),
      ...address,
      deliveryAddressGeo: { lat: WAREHOUSE.lat, lon: WAREHOUSE.lon },
      fulfillmentMethod: "delivery",
    }),
  });
  const { order } = await parseSuccessData(created);

  const stored = await OrderModel.findById(order._id).lean();
  const shipment = stored.shipments[0];
  // 2,4 км по дорогам → 3 полных: 200 + 3 * 30 — ровно то, что видела корзина.
  assert.equal(shipment.sellerDeliveryFeeRub, 290);
  assert.equal(shipment.sellerDeliveryDistanceKm, quote.sellers[0].distanceKm);
  assert.equal(shipment.sellerDeliveryDistanceSource, "road");
  assert.equal(
    geoCalls.filter((call) => call === "route").length,
    1,
    "заказ взял маршрут из кэша котировки",
  );
});

test("адрес не нашёлся на карте нигде — котировка и заказ отказывают, а не везут за вызов", async () => {
  const { productId, buyerCookie } = await setupSellerDelivery("nowhere");
  stubGeoServices({ routeMeters: 2_400, buyerFound: false });

  const response = await postQuote(buyerCookie, {
    productIds: [productId],
    deliveryAddress: "Абракадабра 999",
  });
  assert.equal(response.status, 400);
  assert.match(await parseErrorMessage(response), /не удалось найти адрес/i);
});

test("котировка без авторизации → 401", async () => {
  const response = await request("/order/seller-delivery-quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productIds: [], deliveryAddress: "x" }),
  });
  assert.equal(response.status, 401);
});
