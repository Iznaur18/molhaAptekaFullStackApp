import assert from "node:assert/strict";
import { test } from "node:test";

import {
  LOYALTY_POINTS_ADMIN_FREE_CREDIT_MAX,
  LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN,
  adminCreditLoyaltyPointsBodySchema,
} from "@molha/api-contract";

test("adminCreditLoyaltyPointsBodySchema: accepts in-range amount", () => {
  assert.deepEqual(adminCreditLoyaltyPointsBodySchema.parse({ amount: 100 }), {
    amount: 100,
  });
  assert.equal(LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN, 1);
  assert.equal(LOYALTY_POINTS_ADMIN_FREE_CREDIT_MAX, 999_999);
});

test("adminCreditLoyaltyPointsBodySchema: rejects out of range", () => {
  assert.throws(() => adminCreditLoyaltyPointsBodySchema.parse({ amount: 0 }));
  assert.throws(() =>
    adminCreditLoyaltyPointsBodySchema.parse({ amount: 1_000_000 }),
  );
});
