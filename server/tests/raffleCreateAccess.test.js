import assert from "node:assert/strict";
import { test } from "node:test";

import { RAFFLE_CREATE_PRICE_POINTS } from "@molha/api-contract";

import { hasRaffleCreateUnlock } from "../services/raffle/raffleCreateAccess.js";

test("RAFFLE_CREATE_PRICE_POINTS is 3000", () => {
  assert.equal(RAFFLE_CREATE_PRICE_POINTS, 3_000);
});

test("hasRaffleCreateUnlock detects paid access", () => {
  assert.equal(hasRaffleCreateUnlock(null), false);
  assert.equal(hasRaffleCreateUnlock({}), false);
  assert.equal(hasRaffleCreateUnlock({ raffleCreateUnlockAt: null }), false);
  assert.equal(
    hasRaffleCreateUnlock({ raffleCreateUnlockAt: "2026-01-01T00:00:00.000Z" }),
    false,
  );
  assert.equal(
    hasRaffleCreateUnlock({
      raffleCreateUnlockAt: new Date("2026-01-01T00:00:00.000Z"),
    }),
    true,
  );
});
