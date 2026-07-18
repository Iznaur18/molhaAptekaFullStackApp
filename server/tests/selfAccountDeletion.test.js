import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { UserModel } from "../models/index.js";
import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import {
  parseErrorMessage,
  registerUserAndGetCookie,
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

/**
 * @param {string} cookie
 * @param {string} userId
 */
const deleteOwnAccount = (cookie, userId) =>
  request(`/user/${userId}`, {
    method: "DELETE",
    headers: { Cookie: cookie },
  });

test("обычный юзер удаляет свой аккаунт", async () => {
  const { cookie, user } = await registerUserAndGetCookie(request, "selfdel");

  const response = await deleteOwnAccount(cookie, user._id);
  assert.equal(response.status, 200);

  const stored = await UserModel.findById(user._id).lean();
  assert.equal(stored, null, "профиль должен быть удалён из БД");
});

test("после самоудаления сессия недействительна", async () => {
  const { cookie, user } = await registerUserAndGetCookie(request, "selfsession");

  assert.equal(
    (await request("/auth/me", { headers: { Cookie: cookie } })).status,
    200,
  );

  await deleteOwnAccount(cookie, user._id);

  const me = await request("/auth/me", { headers: { Cookie: cookie } });
  assert.equal(me.status, 401, "cookie удалённого аккаунта не должна работать");
});

test("чужой профиль обычному юзеру удалить нельзя", async () => {
  const victim = await registerUserAndGetCookie(request, "victim");
  const attacker = await registerUserAndGetCookie(request, "attacker");

  const response = await request(`/user/${victim.user._id}`, {
    method: "DELETE",
    headers: { Cookie: attacker.cookie },
  });
  assert.equal(response.status, 403);
  await parseErrorMessage(response);

  const stored = await UserModel.findById(victim.user._id).lean();
  assert.ok(stored, "чужой профиль должен остаться");
});

test("единственный админ не может удалить себя", async () => {
  const { cookie, user } = await registerUserAndGetCookie(request, "soleadmin");
  await UserModel.findByIdAndUpdate(user._id, { userRole: "admin" });

  const response = await deleteOwnAccount(cookie, user._id);
  assert.equal(response.status, 400);

  const stored = await UserModel.findById(user._id).lean();
  assert.ok(stored, "единственный админ должен остаться");
});
