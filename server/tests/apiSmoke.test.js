import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY } from "../constants/orderConstants.js";
import { ProductModel } from "../models/index.js";
import { PRODUCT_MODERATION_APPROVED } from "../constants/productModerationConstants.js";
import {
  buildCookieHeader,
  startHttpTestServer,
  stopHttpTestServer,
} from "./helpers/httpTestApp.js";
import {
  buildTestProductPayload,
  ensureProductCategoryTreeSeeded,
  registerUserAndGetCookie,
} from "./helpers/integrationTestHelpers.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "smoke-test-jwt-secret-min-32-chars-long";
process.env.NODE_ENV = "test";

const registerPayload = (suffix) => ({
  email: `smoke-${suffix}@example.com`,
  password: "secret12",
  passwordConfirm: "secret12",
  userName: `smokeUser${suffix}`,
});

const productPayload = () => buildTestProductPayload();

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

test("GET /health: mongo connected", async () => {
  const response = await request("/health");
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "ok");
  assert.equal(body.mongo, "connected");
  assert.equal(body.uploadStorage, "disk");
  assert.ok(
    body.gitCommit === null || typeof body.gitCommit === "string",
  );
  assert.equal(typeof body.uptimeSec, "number");
  assert.equal(body.catalogSearch, "regex");
});

const parseSuccessData = async (response) => {
  const body = await response.json();
  assert.equal(body.success, true);
  return body.data;
};

test("auth smoke: register pending → verify → me → logout → me guest", async () => {
  const registerResponse = await request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registerPayload("auth")),
  });
  assert.equal(registerResponse.status, 200);
  const pending = await parseSuccessData(registerResponse);
  assert.equal(pending.needsEmailVerification, true);
  assert.ok(typeof pending.pendingToken === "string");
  assert.equal(buildCookieHeader(registerResponse.headers), "");

  const { cookie: authCookie, user } = await registerUserAndGetCookie(
    request,
    "auth2",
  );
  assert.equal(user.email, "int-auth2@example.com");
  assert.ok(authCookie.includes("access_token"));

  const meData = await parseSuccessData(
    await request("/auth/me", {
      headers: { Cookie: authCookie },
    }),
  );
  assert.equal(meData.user.email, "int-auth2@example.com");
  assert.equal(meData.user.isEmailVerified, true);

  const logoutResponse = await request("/auth/logout", {
    method: "POST",
    headers: { Cookie: authCookie },
  });
  assert.equal(logoutResponse.status, 200);

  const meAfterLogout = await request("/auth/me");
  assert.equal(meAfterLogout.status, 200);
  const guestMe = await parseSuccessData(meAfterLogout);
  assert.equal(guestMe.user, null);
  assert.deepEqual(guestMe.inAppNotifications, []);
});

test("auth refresh: register+verify → refresh → me", async () => {
  const { cookie: registerCookies, user } = await registerUserAndGetCookie(
    request,
    "refresh",
  );
  assert.ok(registerCookies.includes("refresh_token"));

  const refreshResponse = await request("/auth/refresh", {
    method: "POST",
    headers: { Cookie: registerCookies },
  });
  assert.equal(refreshResponse.status, 200);

  const refreshedCookies = buildCookieHeader(refreshResponse.headers);
  assert.ok(refreshedCookies.includes("access_token"));

  const meData = await parseSuccessData(
    await request("/auth/me", {
      headers: { Cookie: refreshedCookies },
    }),
  );
  assert.equal(meData.user.email, user.email);
});

test("GET /user/search without search: returns user listing for auth viewer", async () => {
  const { cookie: authCookie } = await registerUserAndGetCookie(
    request,
    "userlist",
  );
  const searchResponse = await request("/user/search?page=1&limit=10", {
    headers: { Cookie: authCookie },
  });
  assert.equal(searchResponse.status, 200);

  const data = await parseSuccessData(searchResponse);
  assert.ok(Array.isArray(data.users));
  assert.ok(data.users.length >= 1);
  assert.equal(typeof data.total, "number");
  assert.ok(data.total >= 1);
  assert.ok(data.users.some((u) => u.userName === "intuseruserlist"));
});

test("auth refresh rotation: old refresh token rejected", async () => {
  const verifyResponse = await (async () => {
    const { cookie } = await registerUserAndGetCookie(request, "rotation");
    const me = await parseSuccessData(
      await request("/auth/me", { headers: { Cookie: cookie } }),
    );
    const loginResponse = await request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: me.user.email,
        password: "secret12",
      }),
    });
    return loginResponse;
  })();
  assert.equal(verifyResponse.status, 200);

  const session = await parseSuccessData(verifyResponse);
  const oldRefreshToken = session.refreshToken;

  const refreshResponse = await request("/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: oldRefreshToken }),
  });
  assert.equal(refreshResponse.status, 200);

  const rotatedSession = await parseSuccessData(refreshResponse);
  assert.notEqual(rotatedSession.refreshToken, oldRefreshToken);

  const staleRefreshResponse = await request("/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: oldRefreshToken }),
  });
  assert.equal(staleRefreshResponse.status, 401);
});

test("auth refresh: body token wins over stale cookie after rotation", async () => {
  const loginResponse = await (async () => {
    const { user } = await registerUserAndGetCookie(request, "bodyovercookie");
    return request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        password: "secret12",
      }),
    });
  })();
  assert.equal(loginResponse.status, 200);

  const staleCookies = buildCookieHeader(loginResponse.headers);
  const session = await parseSuccessData(loginResponse);

  const rotatedResponse = await request("/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: staleCookies,
    },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });
  assert.equal(rotatedResponse.status, 200);

  const rotatedSession = await parseSuccessData(rotatedResponse);
  assert.notEqual(rotatedSession.refreshToken, session.refreshToken);

  const desyncRefreshResponse = await request("/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: staleCookies,
    },
    body: JSON.stringify({ refreshToken: rotatedSession.refreshToken }),
  });
  assert.equal(desyncRefreshResponse.status, 200);
});

test("auth mobile: tokens in JSON after verify, bearer me, refresh by body", async () => {
  const { cookie, user } = await registerUserAndGetCookie(request, "mobile");
  const loginResponse = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.email,
      password: "secret12",
    }),
  });
  assert.equal(loginResponse.status, 200);

  const session = await parseSuccessData(loginResponse);
  assert.equal(session.email, user.email);
  assert.ok(typeof session.accessToken === "string" && session.accessToken.length > 20);
  assert.ok(typeof session.refreshToken === "string" && session.refreshToken.length > 20);

  const meData = await parseSuccessData(
    await request("/auth/me", {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }),
  );
  assert.equal(meData.user.email, user.email);

  const refreshResponse = await request("/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });
  assert.equal(refreshResponse.status, 200);

  const refreshedSession = await parseSuccessData(refreshResponse);
  assert.ok(refreshedSession.accessToken);
  assert.ok(refreshedSession.refreshToken);

  const meAfterRefresh = await parseSuccessData(
    await request("/auth/me", {
      headers: { Authorization: `Bearer ${refreshedSession.accessToken}` },
    }),
  );
  assert.equal(meAfterRefresh.user.email, user.email);
  assert.ok(cookie.includes("access_token"));
});

test("auth refresh: без cookie и body → 401", async () => {
  const response = await request("/auth/refresh", { method: "POST" });
  assert.equal(response.status, 401);
});

test("product smoke: GET /product публичный, POST /product с auth", async () => {
  await ensureProductCategoryTreeSeeded();

  const catalogData = await parseSuccessData(await request("/product"));
  assert.ok(Array.isArray(catalogData.products));

  const { cookie: authCookie } = await registerUserAndGetCookie(
    request,
    "product",
  );

  const createData = await parseSuccessData(
    await request("/product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify(productPayload()),
    }),
  );
  assert.ok(createData.product?._id);
});

test("order smoke: без сессии → 401", async () => {
  await ensureProductCategoryTreeSeeded();

  const { cookie: sellerCookie } = await registerUserAndGetCookie(
    request,
    "orderseller",
  );

  const createProductData = await parseSuccessData(
    await request("/product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sellerCookie,
      },
      body: JSON.stringify(productPayload()),
    }),
  );
  const product = createProductData.product;
  await ProductModel.findByIdAndUpdate(product._id, {
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
  });

  const orderResponse = await request("/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [{ productId: String(product._id), quantity: 1 }],
      deliveryAddress: "Москва, Тверская 1",
      deliveryAddressFlat: "1",
      paymentMethod: ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
    }),
  });
  assert.equal(orderResponse.status, 401);
});

test("login pending registration → needsEmailVerification", async () => {
  const registerResponse = await request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registerPayload("pendinglogin")),
  });
  assert.equal(registerResponse.status, 200);

  const loginResponse = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "smoke-pendinglogin@example.com",
      password: "secret12",
    }),
  });
  assert.equal(loginResponse.status, 403);
  const body = await loginResponse.json();
  assert.equal(body.needsEmailVerification, true);
  assert.ok(typeof body.pendingToken === "string");
  assert.equal(body.email, "smoke-pendinglogin@example.com");
});
