import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import FaqItemLinkModel from "../models/FaqItemLinkModel.js";
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

test("GET /faq/item-links returns empty list by default", async () => {
  const response = await request("/faq/item-links");
  assert.equal(response.status, 200);

  const payload = await parseSuccessData(response);
  assert.deepEqual(payload.links, []);
});

test("PATCH /faq/item-links/:itemId upserts href for admin", async () => {
  const suffix = "faq-link-admin";
  const { cookie, user } = await registerUserAndGetCookie(request, suffix);
  await verifyUserEmail(`int-${suffix}@example.com`);
  await setUserRole(user._id, "admin");

  const patchResponse = await request("/faq/item-links/register", {
    method: "PATCH",
    headers: {
      Cookie: cookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ href: "https://example.com/help/register" }),
  });
  assert.equal(patchResponse.status, 200);

  const patchPayload = await parseSuccessData(patchResponse);
  assert.equal(patchPayload.link.itemId, "register");
  assert.equal(patchPayload.link.href, "https://example.com/help/register");

  const getResponse = await request("/faq/item-links");
  const getPayload = await parseSuccessData(getResponse);
  assert.equal(getPayload.links.length, 1);
  assert.equal(getPayload.links[0]?.href, "https://example.com/help/register");

  const row = await FaqItemLinkModel.findOne({ itemId: "register" }).lean();
  assert.equal(row?.href, "https://example.com/help/register");
});

test("PATCH /faq/item-links/:itemId rejects non-admin", async () => {
  const suffix = "faq-link-user";
  const { cookie } = await registerUserAndGetCookie(request, suffix);
  await verifyUserEmail(`int-${suffix}@example.com`);

  const patchResponse = await request("/faq/item-links/register", {
    method: "PATCH",
    headers: {
      Cookie: cookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ href: "https://example.com/help" }),
  });
  assert.equal(patchResponse.status, 403);
});

test("PATCH /faq/item-links/:itemId rejects javascript href", async () => {
  const suffix = "faq-link-admin2";
  const { cookie, user } = await registerUserAndGetCookie(request, suffix);
  await verifyUserEmail(`int-${suffix}@example.com`);
  await setUserRole(user._id, "admin");

  const patchResponse = await request("/faq/item-links/register", {
    method: "PATCH",
    headers: {
      Cookie: cookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ href: "javascript:alert(1)" }),
  });
  assert.equal(patchResponse.status, 400);
});
