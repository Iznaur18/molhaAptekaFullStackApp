import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { REQUEST_ID_HEADER } from "../constants/requestLogConstants.js";
import { logServerEvent } from "../utils/logServerEvent.js";
import { normalizeIncomingRequestId } from "../utils/normalizeIncomingRequestId.js";
import {
  startHttpTestServer,
  stopHttpTestServer,
} from "./helpers/httpTestApp.js";
import {
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "request-id-test-jwt-secret-min-32-chars";
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

after(async () => {
  if (server) {
    await stopHttpTestServer(server);
  }
  await disconnectMongoTestReplSet();
});

test("normalizeIncomingRequestId: valid and invalid", () => {
  assert.equal(normalizeIncomingRequestId("abc"), null);
  assert.equal(
    normalizeIncomingRequestId("client-req-01"),
    "client-req-01",
  );
  assert.equal(normalizeIncomingRequestId("bad id!"), null);
  assert.equal(normalizeIncomingRequestId("x".repeat(65)), null);
});

test("logServerEvent: single JSON line", () => {
  const lines = [];
  const originalError = console.error;
  console.error = (line) => {
    lines.push(line);
  };

  try {
    logServerEvent("error", { event: "test", requestId: "rid-1" });
    assert.equal(lines.length, 1);
    const parsed = JSON.parse(String(lines[0]));
    assert.equal(parsed.level, "error");
    assert.equal(parsed.event, "test");
    assert.equal(parsed.requestId, "rid-1");
    assert.equal(typeof parsed.time, "string");
  } finally {
    console.error = originalError;
  }
});

test("GET /health: X-Request-Id generated", async () => {
  const response = await request("/health");
  const requestId = response.headers.get(REQUEST_ID_HEADER);
  assert.ok(requestId);
  assert.match(requestId, /^[0-9a-f-]{36}$/i);
});

test("GET /health: echoes client X-Request-Id", async () => {
  const clientId = "e2e-correlation-id-99";
  const response = await request("/health", {
    headers: { [REQUEST_ID_HEADER]: clientId },
  });
  assert.equal(response.headers.get(REQUEST_ID_HEADER), clientId);
});

test("GET unknown route: 404 body includes requestId", async () => {
  const response = await request("/no-such-route-xyz");
  assert.equal(response.status, 404);
  const body = await response.json();
  assert.equal(typeof body.requestId, "string");
  assert.equal(body.requestId, response.headers.get(REQUEST_ID_HEADER));
});
