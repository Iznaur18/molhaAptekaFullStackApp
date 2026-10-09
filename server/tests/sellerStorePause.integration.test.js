import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { SELLER_STORE_PAUSED_PRODUCT_MESSAGE } from "@molha/api-contract";

import { ProductModel, UserModel } from "../models/index.js";
import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import {
  approveProductViaApi,
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

/** @param {string} cookie */
const jsonHeaders = (cookie) => ({
  "Content-Type": "application/json",
  Cookie: cookie,
});

/**
 * @param {string} cookie
 * @param {boolean} paused
 */
const putStorePause = async (cookie, paused) => {
  const response = await request("/sellers/store-pause", {
    method: "PUT",
    headers: jsonHeaders(cookie),
    body: JSON.stringify({ paused }),
  });
  assert.equal(response.status, 200);
  return (await parseSuccessData(response)).storePause;
};

/** @param {unknown} productId */
const readProduct = (productId) =>
  ProductModel.findById(productId)
    .select("productIsAvailable productPausedWithStore productModerationStatus")
    .lean();

/** Продавец с двумя одобренными товарами и модератор. */
const seedSellerWithTwoProducts = async () => {
  await ensureProductCategoryTreeSeeded();

  const { cookie: sellerCookie, user: seller } = await registerUserAndGetCookie(
    request,
    "seller-pause",
  );
  await verifyUserEmail("int-seller-pause@example.com");

  const { cookie: modCookie, user: mod } = await registerUserAndGetCookie(
    request,
    "mod-pause",
  );
  await setUserRole(mod._id, "moderator");

  const first = await createProductViaApi(request, sellerCookie, {
    productName: "Пауза — первый товар",
  });
  const second = await createProductViaApi(request, sellerCookie, {
    productName: "Пауза — второй товар",
  });
  await approveProductViaApi(request, modCookie, first._id);
  await approveProductViaApi(request, modCookie, second._id);

  return { sellerCookie, seller, modCookie, first, second };
};

test("пауза скрывает все товары, включение возвращает только скрытое паузой", async () => {
  const { sellerCookie, seller, first, second } = await seedSellerWithTwoProducts();

  // Второй товар продавец спрятал сам ещё до паузы.
  const hideResponse = await request(`/product/${second._id}`, {
    method: "PATCH",
    headers: jsonHeaders(sellerCookie),
    body: JSON.stringify({ productIsAvailable: false }),
  });
  assert.equal(hideResponse.status, 200);

  const before = await request("/sellers/store-pause/me", {
    headers: { Cookie: sellerCookie },
  });
  assert.deepEqual((await parseSuccessData(before)).storePause, {
    paused: false,
    pausedAt: null,
    visibleProductCount: 1,
    pausedProductCount: 0,
  });

  const paused = await putStorePause(sellerCookie, true);
  assert.equal(paused.paused, true);
  assert.ok(paused.pausedAt);
  assert.equal(paused.visibleProductCount, 0);
  assert.equal(paused.pausedProductCount, 1);

  assert.equal((await readProduct(first._id)).productIsAvailable, false);
  assert.equal((await readProduct(first._id)).productPausedWithStore, true);
  assert.equal((await readProduct(second._id)).productPausedWithStore, undefined);
  assert.equal((await UserModel.findById(seller._id).lean()).sellerStorePaused, true);

  // Повторное включение паузы ничего не ломает.
  assert.equal((await putStorePause(sellerCookie, true)).pausedProductCount, 1);

  const resumed = await putStorePause(sellerCookie, false);
  assert.deepEqual(resumed, {
    paused: false,
    pausedAt: null,
    visibleProductCount: 1,
    pausedProductCount: 0,
  });
  assert.equal((await readProduct(first._id)).productIsAvailable, true);
  assert.equal((await readProduct(first._id)).productPausedWithStore, undefined);
  assert.equal((await readProduct(second._id)).productIsAvailable, false);
});

test("скрытый паузой товар не попадает в каталог", async () => {
  const { sellerCookie, first } = await seedSellerWithTwoProducts();

  const listed = await parseSuccessData(await request("/product?limit=50"));
  assert.ok(listed.products.some((row) => String(row._id) === String(first._id)));

  await putStorePause(sellerCookie, true);

  const hidden = await parseSuccessData(await request("/product?limit=50"));
  assert.equal(hidden.products.length, 0);
});

test("во время паузы товар нельзя включить поштучно, а новый заводится скрытым", async () => {
  const { sellerCookie, modCookie, first } = await seedSellerWithTwoProducts();
  await putStorePause(sellerCookie, true);

  const showResponse = await request(`/product/${first._id}`, {
    method: "PATCH",
    headers: jsonHeaders(sellerCookie),
    body: JSON.stringify({ productIsAvailable: true }),
  });
  assert.equal(showResponse.status, 409);
  assert.equal(
    await parseErrorMessage(showResponse),
    SELLER_STORE_PAUSED_PRODUCT_MESSAGE,
  );

  // Пополнение остатка обычно само возвращает товар на витрину.
  const restockResponse = await request(`/product/${first._id}`, {
    method: "PATCH",
    headers: jsonHeaders(sellerCookie),
    body: JSON.stringify({ productStockQuantity: 9 }),
  });
  assert.equal(restockResponse.status, 200);
  assert.equal((await readProduct(first._id)).productIsAvailable, false);

  // Новый товар, одобренный модератором во время паузы, ждёт скрытым.
  const created = await createProductViaApi(request, sellerCookie, {
    productName: "Пауза — товар во время паузы",
  });
  await approveProductViaApi(request, modCookie, created._id);
  assert.equal((await readProduct(created._id)).productIsAvailable, false);
  assert.equal((await readProduct(created._id)).productPausedWithStore, true);

  const resumed = await putStorePause(sellerCookie, false);
  assert.equal(resumed.visibleProductCount, 3);
  assert.equal((await readProduct(created._id)).productIsAvailable, true);
});

test("PUT /sellers/store-pause требует вход и булево paused", async () => {
  const anonymous = await request("/sellers/store-pause", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paused: true }),
  });
  assert.equal(anonymous.status, 401);

  const { sellerCookie } = await seedSellerWithTwoProducts();
  const invalid = await request("/sellers/store-pause", {
    method: "PUT",
    headers: jsonHeaders(sellerCookie),
    body: JSON.stringify({ paused: "yes" }),
  });
  assert.equal(invalid.status, 400);
});
