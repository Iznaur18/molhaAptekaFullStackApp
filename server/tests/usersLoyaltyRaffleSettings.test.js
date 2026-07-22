import assert from "node:assert/strict";
import test from "node:test";

import { resolveUsersLoyaltyRaffleSettingsPayload } from "../services/loyalty/resolveUsersLoyaltyRaffleSettingsPayload.js";

test("resolveUsersLoyaltyRaffleSettingsPayload: defaults when row missing", () => {
  assert.deepEqual(resolveUsersLoyaltyRaffleSettingsPayload(null), {
    description: "",
    goal: 50_000,
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
      updatedAt: null,
    },
  );
});

test("resolveUsersLoyaltyRaffleSettingsPayload: keeps valid goal", () => {
  assert.equal(
    resolveUsersLoyaltyRaffleSettingsPayload({ description: "", goal: 12_000 }).goal,
    12_000,
  );
});
