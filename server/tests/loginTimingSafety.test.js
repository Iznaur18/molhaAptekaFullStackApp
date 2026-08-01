import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";
import bcrypt from "bcrypt";

import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import {
  buildRegisterPayload,
  completeRegistrationFlow,
} from "./helpers/integrationTestHelpers.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";
import { DUMMY_PASSWORD_HASH } from "../services/auth/dummyPasswordHash.js";

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
 * @param {{ email: string; password: string }} body
 */
const login = (body) =>
  request("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Client": "mobile",
    },
    body: JSON.stringify(body),
  });

test("dummy-хеш — валидный bcrypt cost=10 и не совпадает с произвольным вводом", async () => {
  assert.match(DUMMY_PASSWORD_HASH, /^\$2[aby]\$10\$/);
  assert.equal(await bcrypt.compare("любой-пароль", DUMMY_PASSWORD_HASH), false);
});

test("несуществующий email и неверный пароль дают одинаковый 400 (без enumeration)", async () => {
  const payload = buildRegisterPayload("timing");
  await completeRegistrationFlow(request, payload);

  const unknownEmail = await login({
    email: "nobody-such-user@example.com",
    password: payload.password,
  });
  const wrongPassword = await login({
    email: payload.email,
    password: `${payload.password}-wrong`,
  });

  assert.equal(unknownEmail.status, 400);
  assert.equal(wrongPassword.status, 400);

  const unknownBody = await unknownEmail.json();
  const wrongBody = await wrongPassword.json();
  // текст ответа не должен различать два случая
  assert.equal(unknownBody.message, wrongBody.message);
});

test("верные учётные данные логинятся (200)", async () => {
  const payload = buildRegisterPayload("ok");
  await completeRegistrationFlow(request, payload);

  const ok = await login({ email: payload.email, password: payload.password });
  assert.equal(ok.status, 200);
});
