import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { startHttpTestServer, buildCookieHeader } from "./helpers/httpTestApp.js";
import {
  buildRegisterPayload,
  completeRegistrationFlow,
  parseSuccessData,
} from "./helpers/integrationTestHelpers.js";
import { stopHttpTestServer } from "./helpers/httpTestApp.js";
import { UserModel } from "../models/index.js";
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

/**
 * @param {string} suffix
 */
const registerRaw = async (suffix) => {
  const payload = buildRegisterPayload(suffix);
  const { cookie, session } = await completeRegistrationFlow(request, payload);
  return { payload, cookie, session };
};

/**
 * @param {{ email: string; password: string }} payload
 */
const loginRaw = async (payload) => {
  const response = await request("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Client": "mobile",
    },
    body: JSON.stringify({ email: payload.email, password: payload.password }),
  });
  assert.equal(response.status, 200);
  const data = await parseSuccessData(response);
  return { cookie: buildCookieHeader(response.headers), data };
};

test("logout отзывает access-токен, а не только refresh", async () => {
  const { payload } = await registerRaw("revoke");
  const { cookie, data } = await loginRaw(payload);

  const before = await request("/auth/me", { headers: { Cookie: cookie } });
  assert.equal(before.status, 200, "до logout сессия должна работать");

  await request("/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ refreshToken: data.refreshToken }),
  });

  // Bearer, а не cookie: logout стирает cookie, и без привязки access-токена
  // к authTokenVersion украденный токен жил бы ещё до часа.
  const after = await request("/auth/me", {
    headers: { Authorization: `Bearer ${data.accessToken}` },
  });
  assert.equal(after.status, 401, "access-токен должен быть отозван вместе с сессией");
});

test("refresh работает после повторного логина (authTokenVersion не теряется)", async () => {
  const { payload } = await registerRaw("relogin");

  // Первый logout поднимает authTokenVersion до 1.
  const first = await loginRaw(payload);
  await request("/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: first.cookie },
    body: JSON.stringify({ refreshToken: first.data.refreshToken }),
  });

  // Логин обязан подписать токены реальной версией из БД, а не нулём.
  const second = await loginRaw(payload);

  const refreshed = await request("/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: second.cookie },
    body: JSON.stringify({ refreshToken: second.data.refreshToken }),
  });
  assert.equal(refreshed.status, 200, "refresh после релогина не должен падать в 401");

  // Ротация подняла версию, поэтому дальше идём с новой парой cookie —
  // прежний access-токен намеренно отозван.
  const rotatedCookie = buildCookieHeader(refreshed.headers);
  const me = await request("/auth/me", { headers: { Cookie: rotatedCookie } });
  assert.equal(me.status, 200);

  const stale = await request("/auth/me", { headers: { Cookie: second.cookie } });
  assert.equal(stale.status, 401, "access-токен до ротации должен быть отозван");
});

test("GET /auth/verify-email не принимает 6-значный код из письма", async () => {
  const { cookie, session } = await registerRaw("brute");
  // confirm ставит isEmailVerified; для проверки GET-токена снимаем флаг
  await UserModel.findByIdAndUpdate(session._id, { isEmailVerified: false });

  await request("/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({}),
  });

  // Ссылка подтверждения — неаутентифицированный GET без счётчика попыток.
  // 6-значный код (пространство 10^6) не должен по ней приниматься: иначе
  // email подтверждался бы перебором без доступа к почте.
  for (const guess of ["000000", "123456", "999999"]) {
    const response = await request(`/auth/verify-email?token=${guess}`, {
      redirect: "manual",
    });
    assert.equal(response.status, 400, `код ${guess} должен отсекаться валидацией`);
  }

  const meData = await parseSuccessData(
    await request("/auth/me", { headers: { Cookie: cookie } }),
  );
  assert.equal(meData.user.isEmailVerified, false, "email не должен быть подтверждён");
});
