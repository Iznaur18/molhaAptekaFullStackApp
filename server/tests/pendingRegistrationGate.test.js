import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { PendingRegistrationModel, UserModel } from "../models/index.js";
import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import {
  TEST_REGISTRATION_CODE,
  parseErrorMessage,
  parseSuccessData,
  seedPendingRegistrationCode,
} from "./helpers/integrationTestHelpers.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "pending-reg-test-jwt-secret-min-32-chars";
process.env.NODE_ENV = "test";

/** @type {import('node:http').Server | null} */
let server = null;
/** @type {(path: string, init?: RequestInit) => Promise<Response>} */
let request = async () => new Response();

const payload = (suffix) => ({
  email: `pending-${suffix}@example.com`,
  password: "secret12",
  passwordConfirm: "secret12",
  userName: `pendinguser${suffix}`,
});

const postJson = (path, body) =>
  request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const startRegistration = async (body) => {
  const response = await postJson("/auth/register", body);
  assert.equal(response.status, 200);
  return parseSuccessData(response);
};

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
  if (server) await stopHttpTestServer(server);
  await disconnectMongoTestReplSet();
});

test("register не создаёт пользователя до подтверждения кода", async () => {
  const body = payload("a");
  const data = await startRegistration(body);

  assert.equal(data.pendingRegistration, true);
  assert.ok(data.registrationId);
  // сессии нет: аккаунта ещё не существует
  assert.equal(data.accessToken, undefined);
  assert.equal(data._id, undefined);

  assert.equal(await UserModel.countDocuments({ email: body.email }), 0);
  assert.equal(await UserModel.countDocuments({ userName: body.userName }), 0);
});

test("confirm создаёт аккаунт с подтверждённым email и удаляет заявку", async () => {
  const body = payload("b");
  const data = await startRegistration(body);
  await seedPendingRegistrationCode(data.registrationId);

  const response = await postJson("/auth/register/confirm", {
    registrationId: data.registrationId,
    code: TEST_REGISTRATION_CODE,
  });
  assert.equal(response.status, 200);
  const session = await parseSuccessData(response);
  assert.ok(session._id);

  const user = await UserModel.findOne({ email: body.email });
  assert.ok(user, "аккаунт должен появиться после подтверждения");
  assert.equal(user.isEmailVerified, true);
  assert.equal(user.userName, body.userName);

  assert.equal(await PendingRegistrationModel.countDocuments({}), 0);
});

test("брошенная регистрация не занимает email и никнейм", async () => {
  const abandoned = payload("c");
  await startRegistration(abandoned);

  // пользователь ушёл, не подтвердив почту — в users пусто
  assert.equal(await UserModel.countDocuments({}), 0);

  // другой человек регистрируется с тем же email и ником — и доходит до конца
  const data = await startRegistration(abandoned);
  await seedPendingRegistrationCode(data.registrationId);
  const response = await postJson("/auth/register/confirm", {
    registrationId: data.registrationId,
    code: TEST_REGISTRATION_CODE,
  });

  assert.equal(response.status, 200);
  assert.equal(await UserModel.countDocuments({ email: abandoned.email }), 1);
});

test("подтверждённый email и никнейм больше нельзя занять", async () => {
  const first = payload("d");
  const created = await startRegistration(first);
  await seedPendingRegistrationCode(created.registrationId);
  await postJson("/auth/register/confirm", {
    registrationId: created.registrationId,
    code: TEST_REGISTRATION_CODE,
  });

  const duplicate = await postJson("/auth/register", first);
  assert.equal(duplicate.status, 400);
  assert.match(await parseErrorMessage(duplicate), /уже существует/i);
});

test("неверный код не создаёт аккаунт и считает попытки", async () => {
  const body = payload("e");
  const data = await startRegistration(body);
  await seedPendingRegistrationCode(data.registrationId);

  const response = await postJson("/auth/register/confirm", {
    registrationId: data.registrationId,
    code: "000000",
  });

  assert.equal(response.status, 400);
  assert.equal(await UserModel.countDocuments({}), 0);

  const pending = await PendingRegistrationModel.findById(data.registrationId);
  assert.equal(pending.codeAttemptCount, 1);
});

test("просроченная заявка не подтверждается", async () => {
  const body = payload("f");
  const data = await startRegistration(body);
  await seedPendingRegistrationCode(data.registrationId);
  await PendingRegistrationModel.findByIdAndUpdate(data.registrationId, {
    expiresAt: new Date(Date.now() - 1000),
  });

  const response = await postJson("/auth/register/confirm", {
    registrationId: data.registrationId,
    code: TEST_REGISTRATION_CODE,
  });

  assert.equal(response.status, 400);
  assert.equal(await UserModel.countDocuments({}), 0);
});
