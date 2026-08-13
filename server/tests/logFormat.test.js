import assert from "node:assert/strict";
import test from "node:test";

import {
  formatPrettyServerLogLine,
  resolveLogFormat,
} from "../utils/logFormat.js";

test("resolveLogFormat: defaults and overrides", () => {
  assert.equal(resolveLogFormat({ NODE_ENV: "development" }), "pretty");
  assert.equal(resolveLogFormat({ NODE_ENV: "production" }), "json");
  assert.equal(resolveLogFormat({ NODE_ENV: "test" }), "json");
  assert.equal(
    resolveLogFormat({ NODE_ENV: "development", LOG_FORMAT: "json" }),
    "json",
  );
  assert.equal(
    resolveLogFormat({ NODE_ENV: "production", LOG_FORMAT: "pretty" }),
    "pretty",
  );
});

test("formatPrettyServerLogLine: http.access", () => {
  const line = formatPrettyServerLogLine(
    "info",
    {
      event: "http.access",
      method: "GET",
      path: "/auth/me",
      statusCode: 304,
      latencyMs: 10,
      requestId: "req_x",
      sampled: true,
    },
    new Date("2026-08-13T17:19:04.884Z"),
  );
  assert.match(line, /GET \/auth\/me → 304/);
  assert.match(line, /\(10ms\)/);
  assert.doesNotMatch(line, /requestId/);
});

test("formatPrettyServerLogLine: http_error includes ip", () => {
  const line = formatPrettyServerLogLine("warn", {
    event: "http_error",
    method: "POST",
    path: "/auth/login",
    statusCode: 401,
    ip: "192.168.1.10",
    message: "Unauthorized",
  });
  assert.match(line, /WARN/);
  assert.match(line, /POST \/auth\/login → 401/);
  assert.match(line, /ip=192\.168\.1\.10/);
  assert.match(line, /Unauthorized/);
});
