import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import mongoose from "mongoose";

import { StaffAuditLogModel } from "../models/index.js";
import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import {
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

const registerWithRole = async (suffix, role) => {
  const { cookie, user } = await registerUserAndGetCookie(request, suffix);
  await verifyUserEmail(user.email);
  await setUserRole(user._id, role);
  return { cookie, user };
};

const seedAuditEntries = async (actorUserId) => {
  await StaffAuditLogModel.create({
    actorUserId,
    actorRole: "moderator",
    method: "PATCH",
    action: "PATCH /product/:productId/moderation/approve",
    path: "/product/a/moderation/approve",
    statusCode: 200,
    createdAt: new Date("2026-07-01T10:00:00Z"),
  });
  await StaffAuditLogModel.create({
    actorUserId,
    actorRole: "moderator",
    method: "PATCH",
    action: "PATCH /product/:productId/moderation/reject",
    path: "/product/b/moderation/reject",
    statusCode: 200,
    createdAt: new Date("2026-07-02T10:00:00Z"),
  });
};

test("audit list: admin видит журнал, новые сверху", async () => {
  const { cookie, user } = await registerWithRole("audit-list-admin", "admin");
  await seedAuditEntries(user._id);

  const data = await parseSuccessData(
    await request("/audit/staff-log", { headers: { Cookie: cookie } }),
  );

  assert.equal(data.total, 2);
  assert.equal(data.items.length, 2);
  // Новые сверху: reject (02.07) раньше approve (01.07).
  assert.match(data.items[0].action, /reject$/);
  assert.match(data.items[1].action, /approve$/);
  // Имя сотрудника подставлено.
  assert.ok(data.items[0].actor);
  assert.equal(String(data.items[0].actorUserId), String(user._id));
});

test("audit list: фильтр по действию", async () => {
  const { cookie, user } = await registerWithRole("audit-list-filter", "admin");
  await seedAuditEntries(user._id);

  const data = await parseSuccessData(
    await request("/audit/staff-log?action=approve", { headers: { Cookie: cookie } }),
  );

  assert.equal(data.total, 1);
  assert.equal(data.items.length, 1);
  assert.match(data.items[0].action, /approve$/);
});

test("audit list: фильтр по сотруднику", async () => {
  const { cookie, user } = await registerWithRole("audit-list-actor", "admin");
  await seedAuditEntries(user._id);
  const otherActorId = new mongoose.Types.ObjectId().toString();
  await StaffAuditLogModel.create({
    actorUserId: otherActorId,
    actorRole: "admin",
    method: "DELETE",
    action: "DELETE /product/:productId",
    path: "/product/x",
    statusCode: 200,
  });

  const mine = await parseSuccessData(
    await request(`/audit/staff-log?actorUserId=${user._id}`, {
      headers: { Cookie: cookie },
    }),
  );
  assert.equal(mine.total, 2);

  const other = await parseSuccessData(
    await request(`/audit/staff-log?actorUserId=${otherActorId}`, {
      headers: { Cookie: cookie },
    }),
  );
  assert.equal(other.total, 1);
  assert.match(other.items[0].action, /^DELETE/);
});

test("audit list: не-admin получает 403", async () => {
  const { cookie } = await registerWithRole("audit-list-mod", "moderator");
  const response = await request("/audit/staff-log", { headers: { Cookie: cookie } });
  assert.equal(response.status, 403);
});
