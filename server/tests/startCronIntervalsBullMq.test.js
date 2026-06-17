import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { startCronIntervals } from "../jobs/startCronIntervals.js";

describe("startCronIntervals with BullMQ", () => {
  const savedRedisUrl = process.env.REDIS_URL;
  const savedCronLeader = process.env.CRON_LEADER;
  const savedNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (savedRedisUrl === undefined) {
      delete process.env.REDIS_URL;
    } else {
      process.env.REDIS_URL = savedRedisUrl;
    }

    if (savedCronLeader === undefined) {
      delete process.env.CRON_LEADER;
    } else {
      process.env.CRON_LEADER = savedCronLeader;
    }

    if (savedNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = savedNodeEnv;
    }
  });

  it("skips setInterval cron when REDIS_URL is configured", () => {
    process.env.REDIS_URL = "redis://127.0.0.1:6379";
    process.env.CRON_LEADER = "true";
    process.env.NODE_ENV = "development";

    assert.equal(startCronIntervals(), false);
  });
});
