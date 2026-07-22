import assert from "node:assert/strict";
import { test } from "node:test";

import { pickWeightedRaffleWinnerUserId } from "../services/raffle/pickWeightedRaffleWinner.js";

test("pickWeightedRaffleWinnerUserId: empty → null", () => {
  assert.equal(pickWeightedRaffleWinnerUserId([]), null);
  assert.equal(pickWeightedRaffleWinnerUserId([{ userId: "a", ticketCount: 0 }]), null);
});

test("pickWeightedRaffleWinnerUserId: weight by ticket count", () => {
  const entries = [
    { userId: "buyer-a", ticketCount: 1 },
    { userId: "buyer-b", ticketCount: 3 },
  ];

  assert.equal(
    pickWeightedRaffleWinnerUserId(entries, { randomIntFn: () => 0 }),
    "buyer-a",
  );
  assert.equal(
    pickWeightedRaffleWinnerUserId(entries, { randomIntFn: () => 1 }),
    "buyer-b",
  );
  assert.equal(
    pickWeightedRaffleWinnerUserId(entries, { randomIntFn: () => 3 }),
    "buyer-b",
  );
});
