import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import {
  resolveAccessLogSampleRate,
  shouldSampleAccessLog,
  shouldSkipAccessLogPath,
} from "../utils/accessLogPolicy.js";
import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import {
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "access-log-test-jwt-secret-min-32-chars";
process.env.NODE_ENV = "test";
process.env.ACCESS_LOG_SAMPLE_RATE = "1";

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
  delete process.env.ACCESS_LOG_SAMPLE_RATE;
});

test("resolveAccessLogSampleRate defaults", () => {
  assert.equal(resolveAccessLogSampleRate({ NODE_ENV: "test" }), 0);
  assert.equal(resolveAccessLogSampleRate({ NODE_ENV: "production" }), 0.1);
  assert.equal(resolveAccessLogSampleRate({ NODE_ENV: "development" }), 1);
  assert.equal(
    resolveAccessLogSampleRate({ NODE_ENV: "test", ACCESS_LOG_SAMPLE_RATE: "1" }),
    1,
  );
  assert.equal(
    resolveAccessLogSampleRate({ NODE_ENV: "production", ACCESS_LOG_SAMPLE_RATE: "0" }),
    0,
  );
  assert.equal(
    resolveAccessLogSampleRate({
      NODE_ENV: "production",
      ACCESS_LOG_SAMPLE_RATE: "0.25",
    }),
    0.25,
  );
});

test("shouldSkipAccessLogPath: health and uploads", () => {
  assert.equal(shouldSkipAccessLogPath("/health"), true);
  assert.equal(shouldSkipAccessLogPath("/uploads/x.png"), true);
  assert.equal(shouldSkipAccessLogPath("/product"), false);
});

test("shouldSampleAccessLog", () => {
  assert.equal(shouldSampleAccessLog(1, () => 0.99), true);
  assert.equal(shouldSampleAccessLog(0, () => 0), false);
  assert.equal(shouldSampleAccessLog(0.5, () => 0.4), true);
  assert.equal(shouldSampleAccessLog(0.5, () => 0.6), false);
});

test("GET /product: emits http.access JSON when sampling on", async () => {
  const lines = [];
  const originalLog = console.log;
  console.log = (line) => {
    lines.push(String(line));
  };

  try {
    const response = await request("/product?limit=1");
    assert.ok(response.status === 200 || response.status === 400 || response.status === 401);
    // finish is sync after await fetch resolves
    const accessLines = lines
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter((row) => row && row.event === "http.access");

    assert.ok(accessLines.length >= 1, "expected http.access log line");
    const entry = accessLines[accessLines.length - 1];
    assert.equal(entry.method, "GET");
    assert.equal(entry.path, "/product");
    assert.equal(typeof entry.latencyMs, "number");
    assert.equal(typeof entry.requestId, "string");
    assert.equal(typeof entry.statusCode, "number");
  } finally {
    console.log = originalLog;
  }
});

test("GET /health: no http.access", async () => {
  const lines = [];
  const originalLog = console.log;
  console.log = (line) => {
    lines.push(String(line));
  };

  try {
    const response = await request("/health");
    assert.equal(response.status, 200);
    const accessLines = lines.filter((line) => {
      try {
        return JSON.parse(line).event === "http.access";
      } catch {
        return false;
      }
    });
    assert.equal(accessLines.length, 0);
  } finally {
    console.log = originalLog;
  }
});
