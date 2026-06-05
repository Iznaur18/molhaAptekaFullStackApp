import assert from "node:assert/strict";
import test from "node:test";

import { buildHealthPayload } from "../utils/buildHealthPayload.js";
import {
  initRateLimitRedisStore,
  isRateLimitRedisEnabled,
} from "../utils/rateLimitRedisStore.js";

test("initRateLimitRedisStore returns null without REDIS_URL", async () => {
  const previousUrl = process.env.REDIS_URL;
  delete process.env.REDIS_URL;

  try {
    const store = await initRateLimitRedisStore();
    assert.equal(store, null);
    assert.equal(isRateLimitRedisEnabled(), false);
  } finally {
    if (previousUrl == null) {
      delete process.env.REDIS_URL;
    } else {
      process.env.REDIS_URL = previousUrl;
    }
  }
});

test("buildHealthPayload reports memory rate limit store by default", () => {
  const payload = buildHealthPayload();
  assert.equal(payload.rateLimitStore, "memory");
  assert.equal(payload.catalogSearch, "regex");
});
