import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { PASSWORD_RESET_GENERIC_MESSAGE } from "../constants/passwordResetConstants.js";
import { UserModel } from "../models/index.js";
import { hashEmailVerificationSecret } from "../services/auth/emailVerification.js";
import { startHttpTestServer, stopHttpTestServer, buildCookieHeader } from "./helpers/httpTestApp.js";
import {
  buildRegisterPayload,
  completeRegistrationFlow,
  parseErrorMessage,
  parseSuccessData,
} from "./helpers/integrationTestHelpers.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";
process.env.NODE_ENV = "test";

const TEST_RESET_CODE = "654321";

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

test("password reset: anti-enumeration + confirm sets hash and revokes sessions", async () => {
  const payload = buildRegisterPayload("pwdreset");
  const { cookie, session } = await completeRegistrationFlow(request, payload);

  const unknown = await request("/auth/password/reset/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "nobody-reset@example.com" }),
  });
  assert.equal(unknown.status, 200);
  const unknownData = await parseSuccessData(unknown);
  assert.equal(unknownData.message, PASSWORD_RESET_GENERIC_MESSAGE);

  const issued = await request("/auth/password/reset/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: payload.email }),
  });
  assert.equal(issued.status, 200);
  const issuedData = await parseSuccessData(issued);
  assert.equal(issuedData.message, PASSWORD_RESET_GENERIC_MESSAGE);

  await UserModel.findByIdAndUpdate(session._id, {
    $set: {
      passwordResetTokenHash: hashEmailVerificationSecret(TEST_RESET_CODE),
      passwordResetExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      passwordResetAttemptCount: 0,
    },
  });

  const confirm = await request("/auth/password/reset/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      code: TEST_RESET_CODE,
      newPassword: "newsecret99",
      newPasswordConfirm: "newsecret99",
    }),
  });
  assert.equal(confirm.status, 200);

  const meAfter = await request("/auth/me", { headers: { Cookie: cookie } });
  assert.equal(meAfter.status, 401, "старая сессия должна умереть после reset");

  const loginOld = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: payload.email, password: payload.password }),
  });
  assert.equal(loginOld.status, 400);

  const loginNew = await request("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Client": "mobile",
    },
    body: JSON.stringify({ email: payload.email, password: "newsecret99" }),
  });
  assert.equal(loginNew.status, 200);
  const loginData = await parseSuccessData(loginNew);
  assert.ok(loginData._id);
});

test("password change: requires current password and rotates session", async () => {
  const payload = buildRegisterPayload("pwdchg");
  const { cookie } = await completeRegistrationFlow(request, payload);

  const bad = await request("/auth/password/change", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      currentPassword: "wrong-pass",
      newPassword: "newer99",
      newPasswordConfirm: "newer99",
    }),
  });
  assert.equal(bad.status, 400);
  assert.match(await parseErrorMessage(bad), /текущий пароль/i);

  const ok = await request("/auth/password/change", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
      "X-Auth-Client": "mobile",
    },
    body: JSON.stringify({
      currentPassword: payload.password,
      newPassword: "newer99",
      newPasswordConfirm: "newer99",
    }),
  });
  assert.equal(ok.status, 200);
  const okData = await parseSuccessData(ok);
  assert.ok(okData.accessToken);
  assert.ok(okData.message);

  const newCookie = buildCookieHeader(ok.headers);
  const me = await request("/auth/me", {
    headers: {
      Cookie: newCookie || cookie,
      Authorization: `Bearer ${okData.accessToken}`,
    },
  });
  assert.equal(me.status, 200);

  const login = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: payload.email, password: "newer99" }),
  });
  assert.equal(login.status, 200);
});
