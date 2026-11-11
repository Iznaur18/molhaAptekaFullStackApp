import assert from "node:assert/strict";
import { test } from "node:test";

import {
  pickWeightedRaffleWinnerUserId,
  pickWeightedRaffleWinnersUserIds,
} from "../services/raffle/pickWeightedRaffleWinner.js";

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

test("pickWeightedRaffleWinnersUserIds: empty → []", () => {
  assert.deepEqual(pickWeightedRaffleWinnersUserIds([], 3), []);
  assert.deepEqual(
    pickWeightedRaffleWinnersUserIds([{ userId: "a", ticketCount: 0 }], 5),
    [],
  );
  assert.deepEqual(
    pickWeightedRaffleWinnersUserIds([{ userId: "a", ticketCount: 1 }], 0),
    [],
  );
});

test("pickWeightedRaffleWinnersUserIds: no repeats, order of rolls", () => {
  const entries = [
    { userId: "buyer-a", ticketCount: 1 },
    { userId: "buyer-b", ticketCount: 3 },
    { userId: "buyer-c", ticketCount: 2 },
  ];

  // Первый ролл попадает в buyer-b (вес 3 из 6), второй — в buyer-c
  // (оставшиеся билеты: a=1, c=2 → ролл 2 попадает в c).
  const rolls = [3, 2];
  const winners = pickWeightedRaffleWinnersUserIds(entries, 2, {
    randomIntFn: () => rolls.shift() ?? 0,
  });
  assert.deepEqual(winners, ["buyer-b", "buyer-c"]);
});

test("pickWeightedRaffleWinnersUserIds: participants fewer than count → all participants", () => {
  const entries = [
    { userId: "buyer-a", ticketCount: 1 },
    { userId: "buyer-b", ticketCount: 1 },
  ];

  const winners = pickWeightedRaffleWinnersUserIds(entries, 100, {
    randomIntFn: () => 0,
  });
  assert.equal(winners.length, 2);
  assert.deepEqual(new Set(winners), new Set(["buyer-a", "buyer-b"]));
});

test("pickWeightedRaffleWinnersUserIds: never picks the same user twice", () => {
  const entries = [
    { userId: "buyer-a", ticketCount: 10 },
    { userId: "buyer-b", ticketCount: 10 },
    { userId: "buyer-c", ticketCount: 10 },
  ];

  // Ролл всегда 0 — без удаления из пула это дало бы трижды buyer-a.
  const winners = pickWeightedRaffleWinnersUserIds(entries, 3, {
    randomIntFn: () => 0,
  });
  assert.equal(winners.length, 3);
  assert.equal(new Set(winners).size, 3);
});
