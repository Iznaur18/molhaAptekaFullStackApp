import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import mongoose from "mongoose";

import { StaffAuditLogModel } from "../models/index.js";
import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import {
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

/** Ждём fire-and-forget запись аудита (пишется в res.finish, после ответа). */
const waitForAuditEntries = async (filter, { tries = 30, delayMs = 50 } = {}) => {
  for (let i = 0; i < tries; i += 1) {
    const entries = await StaffAuditLogModel.find(filter).lean();
    if (entries.length > 0) {
      return entries;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return [];
};

const registerModerator = async (suffix) => {
  const { cookie, user } = await registerUserAndGetCookie(request, suffix);
  await verifyUserEmail(user.email);
  await setUserRole(user._id, "moderator");
  return { cookie, user };
};

test("audit: staff-мутация пишется в журнал (даже при бизнес-ошибке)", async () => {
  const { cookie, user } = await registerModerator("audit-mod");
  const missingProductId = new mongoose.Types.ObjectId().toString();

  const response = await request(`/product/${missingProductId}/moderation/approve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({}),
  });

  // Товара нет → бизнес-ошибка, но запрос прошёл staff-гейт и должен быть в аудите.
  assert.ok(response.status >= 400, `ожидался >=400, получено ${response.status}`);

  const entries = await waitForAuditEntries({ actorUserId: user._id });
  assert.equal(entries.length, 1, "должна быть ровно одна запись аудита");

  const entry = entries[0];
  assert.equal(entry.method, "PATCH");
  assert.equal(entry.actorRole, "moderator");
  assert.equal(entry.action, "PATCH /product/:productId/moderation/approve");
  assert.equal(String(entry.actorUserId), String(user._id));
  assert.equal(entry.statusCode, response.status);
  assert.equal(entry.params.productId, missingProductId);
});

test("audit: публичное чтение НЕ пишется в журнал", async () => {
  const { cookie } = await registerModerator("audit-read");

  // GET-чтение staff-очереди и публичный листинг — не мутации, не логируются.
  await request("/product/moderation/pending", { headers: { Cookie: cookie } });
  await request("/product?page=1&limit=5");

  // Небольшая пауза на случай ошибочной асинхронной записи.
  await new Promise((resolve) => setTimeout(resolve, 200));

  const count = await StaffAuditLogModel.countDocuments({});
  assert.equal(count, 0, "чтения не должны попадать в аудит");
});
