/**
 * G.3 API smoke: buyer-critical HTTP path (same endpoints as mobile entities).
 * Requires server + e2e seed (`node server/scripts/e2ePlaywrightSeed.js`).
 */
import { fileURLToPath } from "node:url";
import path from "node:path";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

/** Sync with `server/scripts/e2ePlaywrightSeed.js` + `client/e2e/helpers/fixtures.js` */
const E2E = {
  buyerEmail: process.env.BUYER_SMOKE_EMAIL ?? "e2e-buyer@example.com",
  password: process.env.BUYER_SMOKE_PASSWORD ?? "E2eTestPass12!",
  catalogProductName: "E2E Playwright Catalog Item",
  deliveryAddress: "Москва, Тверская 1",
  deliveryAddressFlat: "1",
};

const API_BASE = (process.env.BUYER_SMOKE_API_URL ?? "http://127.0.0.1:4444").replace(
  /\/$/,
  "",
);

const fail = (message) => {
  console.error(`✗ ${message}`);
  process.exit(1);
};

const ok = (message) => {
  console.log(`✓ ${message}`);
};

const requestJson = async (pathname, init = {}) => {
  const response = await fetch(`${API_BASE}${pathname}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { response, body };
};

const assertSuccess = (label, result) => {
  if (!result.response.ok || result.body?.success !== true) {
    fail(
      `${label}: ${result.response.status} ${typeof result.body === "string" ? result.body : JSON.stringify(result.body)}`,
    );
  }
};

const authHeaders = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
});

const run = async () => {
  console.log("Buyer-critical path API smoke (G.3)\n");
  console.log(`API: ${API_BASE}\n`);

  let health;
  try {
    health = await requestJson("/health");
  } catch (error) {
    fail(
      `server unreachable at ${API_BASE} — start server and run e2e seed (${path.relative(SCRIPT_DIR, path.resolve(SCRIPT_DIR, "../../server/scripts/e2ePlaywrightSeed.js"))})`,
    );
  }
  if (health.response.status !== 200 || health.body?.status !== "ok" || health.body?.mongo !== "connected") {
    fail(`GET /health: unexpected body ${JSON.stringify(health.body)}`);
  }
  ok("GET /health");

  const catalog = await requestJson("/product?page=1&limit=50");
  assertSuccess("GET /product", catalog);
  const products = catalog.body?.data?.products ?? [];
  if (!Array.isArray(products) || products.length === 0) {
    fail("GET /product: empty products — run e2e seed");
  }
  const fixtureProduct =
    products.find((item) => item?.productName === E2E.catalogProductName) ?? products[0];
  const productId = String(fixtureProduct._id ?? "");
  if (!productId) {
    fail("GET /product: missing product id");
  }
  ok(`GET /product (${products.length} items, fixture: ${fixtureProduct.productName})`);

  const login = await requestJson("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: E2E.buyerEmail, password: E2E.password }),
  });
  assertSuccess("POST /auth/login", login);
  const accessToken = login.body?.data?.accessToken;
  if (typeof accessToken !== "string" || accessToken.length === 0) {
    fail("POST /auth/login: missing accessToken in body.data");
  }
  ok("POST /auth/login");

  const me = await requestJson("/auth/me", { headers: authHeaders(accessToken) });
  assertSuccess("GET /auth/me", me);
  if (!me.body?.data?.user?._id) {
    fail("GET /auth/me: missing user");
  }
  ok("GET /auth/me (profile)");

  const catalogProduct = await requestJson(`/product/${productId}/catalog`);
  assertSuccess(`GET /product/${productId}/catalog`, catalogProduct);
  ok("GET /product/:id/catalog (card)");

  const clearCart = await requestJson("/cart", {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ items: {} }),
  });
  assertSuccess("PUT /cart (clear)", clearCart);
  ok("PUT /cart (clear)");

  const addCart = await requestJson("/cart", {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ items: { [productId]: 1 } }),
  });
  assertSuccess("PUT /cart (add)", addCart);
  if (addCart.body?.data?.items?.[productId] !== 1) {
    fail("PUT /cart: item quantity not persisted");
  }
  ok("PUT /cart (add)");

  const getCart = await requestJson("/cart", { headers: authHeaders(accessToken) });
  assertSuccess("GET /cart", getCart);
  ok("GET /cart");

  const createOrder = await requestJson("/order", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      items: [{ productId, quantity: 1 }],
      deliveryAddress: E2E.deliveryAddress,
      deliveryAddressFlat: E2E.deliveryAddressFlat,
      paymentMethod: "cardPrepaid",
    }),
  });
  assertSuccess("POST /order", createOrder);
  if (!createOrder.body?.data?.order?._id) {
    fail("POST /order: missing order");
  }
  ok("POST /order");

  const orders = await requestJson("/order", { headers: authHeaders(accessToken) });
  assertSuccess("GET /order", orders);
  const orderList = orders.body?.data?.orders ?? orders.body?.data ?? [];
  if (!Array.isArray(orderList) || orderList.length === 0) {
    fail("GET /order: empty orders list after checkout");
  }
  ok(`GET /order (${orderList.length} orders)`);

  await requestJson("/cart", {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ items: {} }),
  });

  console.log("\n---\nPASS — buyer-critical API path");
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
