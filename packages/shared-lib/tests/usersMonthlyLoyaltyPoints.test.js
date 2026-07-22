import assert from "node:assert/strict";
import test from "node:test";

import {
  formatLoyaltyPointsCount,
  resolveLoyaltyPointsProgressPercent,
  USERS_MONTHLY_LOYALTY_POINTS_GOAL,
} from "@izibuy/shared-lib";

test("USERS_MONTHLY_LOYALTY_POINTS_GOAL is 50000", () => {
  assert.equal(USERS_MONTHLY_LOYALTY_POINTS_GOAL, 50_000);
});

test("resolveLoyaltyPointsProgressPercent clamps 0..100", () => {
  assert.equal(resolveLoyaltyPointsProgressPercent(0, 50_000), 0);
  assert.equal(resolveLoyaltyPointsProgressPercent(25_000, 50_000), 50);
  assert.equal(resolveLoyaltyPointsProgressPercent(50_000, 50_000), 100);
  assert.equal(resolveLoyaltyPointsProgressPercent(80_000, 50_000), 100);
  assert.equal(resolveLoyaltyPointsProgressPercent(-10, 50_000), 0);
  assert.equal(resolveLoyaltyPointsProgressPercent(10, 0), 0);
});

test("formatLoyaltyPointsCount uses ru grouping", () => {
  assert.equal(formatLoyaltyPointsCount(50_000), "50 000");
  assert.equal(formatLoyaltyPointsCount(1234), "1 234");
});
