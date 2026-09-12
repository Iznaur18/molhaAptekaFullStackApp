import assert from "node:assert/strict";
import test from "node:test";

import {
  applyMonthlyProgressBaseline,
  resolveUsersLoyaltyRaffleSettingsPayload,
} from "../services/loyalty/resolveUsersLoyaltyRaffleSettingsPayload.js";

test("resolveUsersLoyaltyRaffleSettingsPayload: defaults when row missing", () => {
  assert.deepEqual(resolveUsersLoyaltyRaffleSettingsPayload(null), {
    description: "",
    goal: 50_000,
    progressBaseline: 0,
    progressBaselineYear: null,
    progressBaselineMonth: null,
    updatedAt: null,
  });
});

test("resolveUsersLoyaltyRaffleSettingsPayload: trims description and clamps invalid goal", () => {
  assert.deepEqual(
    resolveUsersLoyaltyRaffleSettingsPayload({
      description: "  hello  ",
      goal: 0,
      updatedAt: null,
    }),
    {
      description: "hello",
      goal: 50_000,
      progressBaseline: 0,
      progressBaselineYear: null,
      progressBaselineMonth: null,
      updatedAt: null,
    },
  );
});

test("resolveUsersLoyaltyRaffleSettingsPayload: keeps valid goal and baseline", () => {
  const payload = resolveUsersLoyaltyRaffleSettingsPayload({
    description: "",
    goal: 12_000,
    progressBaseline: 1500,
    progressBaselineYear: 2026,
    progressBaselineMonth: 9,
  });
  assert.equal(payload.goal, 12_000);
  assert.equal(payload.progressBaseline, 1500);
  assert.equal(payload.progressBaselineYear, 2026);
  assert.equal(payload.progressBaselineMonth, 9);
});

test("applyMonthlyProgressBaseline: subtracts only for matching month", () => {
  const settings = {
    progressBaseline: 1000,
    progressBaselineYear: 2026,
    progressBaselineMonth: 9,
  };
  assert.equal(applyMonthlyProgressBaseline(1153, settings, 2026, 9), 153);
  assert.equal(applyMonthlyProgressBaseline(800, settings, 2026, 9), 0);
  assert.equal(applyMonthlyProgressBaseline(1153, settings, 2026, 10), 1153);
});
