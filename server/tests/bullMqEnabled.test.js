import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { isBullMqEnabled } from "../queues/bullMqEnabled.js";

describe("bullMqEnabled", () => {
  const savedRedisUrl = process.env.REDIS_URL;

  afterEach(() => {
    if (savedRedisUrl === undefined) {
      delete process.env.REDIS_URL;
    } else {
      process.env.REDIS_URL = savedRedisUrl;
    }
  });

  it("isBullMqEnabled is false without REDIS_URL", () => {
    delete process.env.REDIS_URL;
    assert.equal(isBullMqEnabled(), false);
  });

  it("isBullMqEnabled is true when REDIS_URL is set", () => {
    process.env.REDIS_URL = "redis://127.0.0.1:6379";
    assert.equal(isBullMqEnabled(), true);
  });
});
