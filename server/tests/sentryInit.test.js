import assert from "node:assert/strict";
import { test } from "node:test";

import { scrubSentryEventPii } from "../utils/scrubSentryEventPii.js";
import { isServerSentryEnabled, initServerSentry } from "../utils/initServerSentry.js";
import { resolveHttpErrorStatus } from "../utils/resolveHttpErrorStatus.js";
import { AppError } from "../errors/AppError.js";

test("isServerSentryEnabled: false without DSN", () => {
  const prev = process.env.SENTRY_DSN;
  delete process.env.SENTRY_DSN;
  assert.equal(isServerSentryEnabled(), false);
  if (prev) {
    process.env.SENTRY_DSN = prev;
  }
});

test("initServerSentry: no-op without DSN", () => {
  const prev = process.env.SENTRY_DSN;
  delete process.env.SENTRY_DSN;
  assert.equal(initServerSentry(), false);
  if (prev) {
    process.env.SENTRY_DSN = prev;
  }
});

test("scrubSentryEventPii: filters cookie and authorization", () => {
  const event = {
    request: {
      headers: {
        Cookie: "access_token=secret",
        Authorization: "Bearer x",
        Accept: "application/json",
      },
    },
  };
  const scrubbed = scrubSentryEventPii(event);
  assert.equal(scrubbed?.request?.headers?.Cookie, "[Filtered]");
  assert.equal(scrubbed?.request?.headers?.Authorization, "[Filtered]");
  assert.equal(scrubbed?.request?.headers?.Accept, "application/json");
});

test("resolveHttpErrorStatus: AppError 400 is not sent to Sentry path", () => {
  const status = resolveHttpErrorStatus(new AppError(400, "bad"));
  assert.equal(status, 400);
  assert.ok(status < 500);
});
