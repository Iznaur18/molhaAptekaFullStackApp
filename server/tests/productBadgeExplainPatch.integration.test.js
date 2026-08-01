import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import ProductBadgeExplainModel from "../models/ProductBadgeExplainModel.js";
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

test("GET /product/badge-explains returns empty list by default", async () => {
  const response = await request("/product/badge-explains");
  assert.equal(response.status, 200);

  const payload = await parseSuccessData(response);
  assert.ok(Array.isArray(payload.displays));
  assert.equal(payload.displays.length, 0);
});

test("PATCH /product/badge-explains/:badgeKey upserts imageUrl + description for moderator", async () => {
  const suffix = "mod-badge-explain";
  const { cookie, user } = await registerUserAndGetCookie(request, suffix);
  await verifyUserEmail(`int-${suffix}@example.com`);
  await setUserRole(user._id, "moderator");

  const patchResponse = await request("/product/badge-explains/original", {
    method: "PATCH",
    headers: {
      Cookie: cookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageUrl: "/uploads/test-original-badge.png",
      description: "Товар отмечен как оригинал продавцом.",
    }),
  });

  assert.equal(patchResponse.status, 200);
  const patchPayload = await parseSuccessData(patchResponse);
  assert.equal(patchPayload.display.badgeKey, "original");
  assert.equal(patchPayload.display.imageUrl, "/uploads/test-original-badge.png");
  assert.equal(
    patchPayload.display.description,
    "Товар отмечен как оригинал продавцом.",
  );

  const getResponse = await request("/product/badge-explains");
  const getPayload = await parseSuccessData(getResponse);
  assert.equal(getPayload.displays.length, 1);

  const row = await ProductBadgeExplainModel.findOne({ badgeKey: "original" }).lean();
  assert.equal(row?.imageUrl, "/uploads/test-original-badge.png");
  assert.equal(row?.description, "Товар отмечен как оригинал продавцом.");
});

test("PATCH /product/badge-explains/:badgeKey rejects unknown key", async () => {
  const suffix = "mod-badge-explain-bad";
  const { cookie, user } = await registerUserAndGetCookie(request, suffix);
  await verifyUserEmail(`int-${suffix}@example.com`);
  await setUserRole(user._id, "moderator");

  const patchResponse = await request("/product/badge-explains/not-a-badge", {
    method: "PATCH",
    headers: {
      Cookie: cookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description: "x" }),
  });

  assert.equal(patchResponse.status, 400);
});
