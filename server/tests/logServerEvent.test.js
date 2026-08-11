import assert from "node:assert/strict";
import { test } from "node:test";

import { scrubLogFieldsPii } from "../utils/scrubLogFieldsPii.js";
import { formatLogError, logServerEvent } from "../utils/logServerEvent.js";

test("scrubLogFieldsPii: masks sensitive keys, keeps event fields", () => {
  const scrubbed = scrubLogFieldsPii({
    email: "a@b.c",
    phone: "+79991234567",
    password: "secret",
    token: "jwt-here",
    nested: { authorization: "Bearer x", ok: 1 },
    message: "safe",
  });

  assert.equal(scrubbed.email, "[Filtered]");
  assert.equal(scrubbed.phone, "[Filtered]");
  assert.equal(scrubbed.password, "[Filtered]");
  assert.equal(scrubbed.token, "[Filtered]");
  assert.deepEqual(scrubbed.nested, { authorization: "[Filtered]", ok: 1 });
  assert.equal(scrubbed.message, "safe");
});

test("formatLogError: Error with stack and code", () => {
  const err = new Error("boom");
  /** @type {Error & { code?: string }} */
  const withCode = err;
  withCode.code = "ECONNREFUSED";
  const fields = formatLogError(withCode);
  assert.equal(fields.message, "boom");
  assert.equal(fields.code, "ECONNREFUSED");
  assert.equal(typeof fields.stack, "string");
});

test("logServerEvent: JSON line + PII scrub + event first-class", () => {
  const lines = [];
  const originalError = console.error;
  console.error = (line) => {
    lines.push(line);
  };

  try {
    logServerEvent("error", {
      event: "cron.job_failed",
      job: "process_premium_cron_tasks",
      email: "leak@example.com",
      message: "fail",
    });
    assert.equal(lines.length, 1);
    const parsed = JSON.parse(String(lines[0]));
    assert.equal(parsed.level, "error");
    assert.equal(parsed.event, "cron.job_failed");
    assert.equal(parsed.job, "process_premium_cron_tasks");
    assert.equal(parsed.email, "[Filtered]");
    assert.equal(parsed.message, "fail");
    assert.equal(typeof parsed.time, "string");
  } finally {
    console.error = originalError;
  }
});
