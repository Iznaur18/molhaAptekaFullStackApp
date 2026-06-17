import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";

import { shouldRunCronOnThisProcess } from "../jobs/shouldRunCronOnThisProcess.js";

describe("shouldRunCronOnThisProcess", () => {
  const savedCronLeader = process.env.CRON_LEADER;
  const savedNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
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

  it("returns true when CRON_LEADER=true", () => {
    process.env.CRON_LEADER = "true";
    process.env.NODE_ENV = "production";
    assert.equal(shouldRunCronOnThisProcess(), true);
  });

  it("returns false when CRON_LEADER=false", () => {
    process.env.CRON_LEADER = "false";
    process.env.NODE_ENV = "development";
    assert.equal(shouldRunCronOnThisProcess(), false);
  });

  it("defaults to true in non-production when CRON_LEADER unset", () => {
    delete process.env.CRON_LEADER;
    process.env.NODE_ENV = "development";
    assert.equal(shouldRunCronOnThisProcess(), true);
  });

  it("defaults to false in production when CRON_LEADER unset", () => {
    delete process.env.CRON_LEADER;
    process.env.NODE_ENV = "production";
    assert.equal(shouldRunCronOnThisProcess(), false);
  });
});
