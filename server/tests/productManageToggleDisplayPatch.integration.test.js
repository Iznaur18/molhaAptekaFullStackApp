import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import ProductManageToggleDisplayModel from "../models/ProductManageToggleDisplayModel.js";
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

test("GET /product/manage-toggle-displays returns empty list by default", async () => {
  const response = await request("/product/manage-toggle-displays");
  assert.equal(response.status, 200);

  const payload = await parseSuccessData(response);
  assert.ok(Array.isArray(payload.displays));
  assert.equal(payload.displays.length, 0);
});

test("PATCH /product/manage-toggle-displays/:toggleKey upserts imageUrl for moderator", async () => {
  const suffix = "mod-toggle-display";
  const { cookie, user } = await registerUserAndGetCookie(request, suffix);
  await verifyUserEmail(`int-${suffix}@example.com`);
  await setUserRole(user._id, "moderator");

  const patchResponse = await request("/product/manage-toggle-displays/auction", {
    method: "PATCH",
    headers: {
      Cookie: cookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl: "/uploads/test-auction-toggle.png" }),
  });

  assert.equal(patchResponse.status, 200);
  const patchPayload = await parseSuccessData(patchResponse);
  assert.equal(patchPayload.display.toggleKey, "auction");
  assert.equal(patchPayload.display.imageUrl, "/uploads/test-auction-toggle.png");

  const getResponse = await request("/product/manage-toggle-displays");
  const getPayload = await parseSuccessData(getResponse);
  assert.equal(getPayload.displays.length, 1);

  const row = await ProductManageToggleDisplayModel.findOne({ toggleKey: "auction" }).lean();
  assert.equal(row?.imageUrl, "/uploads/test-auction-toggle.png");
});

test("PATCH /product/manage-toggle-displays/:toggleKey rejects unknown toggleKey", async () => {
  const suffix = "mod-toggle-invalid";
  const { cookie, user } = await registerUserAndGetCookie(request, suffix);
  await verifyUserEmail(`int-${suffix}@example.com`);
  await setUserRole(user._id, "moderator");

  const patchResponse = await request("/product/manage-toggle-displays/unknown", {
    method: "PATCH",
    headers: {
      Cookie: cookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl: "/uploads/x.png" }),
  });

  assert.equal(patchResponse.status, 400);
});
