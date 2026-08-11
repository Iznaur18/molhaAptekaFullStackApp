import assert from "node:assert/strict";
import { test } from "node:test";

import {
  logSecurityEvent,
  securityRequestFields,
} from "../services/auth/logSecurityEvent.js";

test("logSecurityEvent: security.* namespace, scrubs email", () => {
  const lines = [];
  const originalWarn = console.warn;
  console.warn = (line) => {
    lines.push(String(line));
  };
  try {
    logSecurityEvent("warn", "login_failed", {
      reason: "invalid_credentials",
      methodKind: "email_password",
      email: "leak@x.com",
    });
    const parsed = JSON.parse(lines[0]);
    assert.equal(parsed.event, "security.login_failed");
    assert.equal(parsed.reason, "invalid_credentials");
    assert.equal(parsed.email, "[Filtered]");
  } finally {
    console.warn = originalWarn;
  }
});

test("securityRequestFields: picks requestId/ip/path", () => {
  const fields = securityRequestFields({
    requestId: "rid-1",
    method: "POST",
    path: "/auth/login",
    ip: "127.0.0.1",
  });
  assert.deepEqual(fields, {
    requestId: "rid-1",
    method: "POST",
    path: "/auth/login",
    ip: "127.0.0.1",
  });
});
