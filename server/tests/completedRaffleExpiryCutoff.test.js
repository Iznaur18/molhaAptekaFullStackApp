import assert from "node:assert/strict";
import { test } from "node:test";

import { SITE_RAFFLES_COMPLETED_VITRINE_TTL_MS } from "../constants/raffleConstants.js";
import { getCompletedRaffleExpiryCutoff } from "../services/raffle/getCompletedRaffleExpiryCutoff.js";

test("getCompletedRaffleExpiryCutoff: 12h before now", () => {
  const now = new Date("2026-07-21T18:00:00.000Z");
  const cutoff = getCompletedRaffleExpiryCutoff(now);
  assert.equal(
    cutoff.getTime(),
    now.getTime() - SITE_RAFFLES_COMPLETED_VITRINE_TTL_MS,
  );
  assert.equal(SITE_RAFFLES_COMPLETED_VITRINE_TTL_MS, 12 * 60 * 60 * 1000);
});
