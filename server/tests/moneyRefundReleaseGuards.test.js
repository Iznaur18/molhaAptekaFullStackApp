import assert from "node:assert/strict";
import test from "node:test";

import { refundLoyaltyPoints } from "../services/loyalty/loyaltyPointsSpend.js";
import { refundRubBalance } from "../services/loyalty/rubBalanceSpend.js";
import { releaseLoyaltyPointsReservation } from "../services/loyalty/loyaltyPointsReserve.js";

test("refundLoyaltyPoints: amount <= 0 throws", async () => {
  await assert.rejects(
    () => refundLoyaltyPoints({ userId: "x", amount: 0 }),
    /больше 0/,
  );
});

test("refundRubBalance: amount <= 0 throws", async () => {
  await assert.rejects(() => refundRubBalance({ userId: "x", amount: -1 }), /больше 0/);
});

test("releaseLoyaltyPointsReservation: amount <= 0 throws", async () => {
  await assert.rejects(
    () => releaseLoyaltyPointsReservation({ userId: "x", amount: 0 }),
    /больше 0/,
  );
});
