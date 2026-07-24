import assert from "node:assert/strict";
import test from "node:test";

import {
  CONVERT_PARTNER_BALANCE_AMOUNT_MAX,
  convertPartnerBalanceBodySchema,
} from "../src/partnerProgram.js";

test("convertPartnerBalanceBodySchema: accepts amount", () => {
  assert.deepEqual(convertPartnerBalanceBodySchema.parse({ amount: 100 }), {
    amount: 100,
  });
});

test("convertPartnerBalanceBodySchema: accepts optional idempotencyKey", () => {
  assert.deepEqual(
    convertPartnerBalanceBodySchema.parse({
      amount: 50,
      idempotencyKey: "client-key-1",
    }),
    { amount: 50, idempotencyKey: "client-key-1" },
  );
});

test("convertPartnerBalanceBodySchema: rejects invalid amount", () => {
  assert.throws(() => convertPartnerBalanceBodySchema.parse({ amount: 0 }));
  assert.throws(() =>
    convertPartnerBalanceBodySchema.parse({
      amount: CONVERT_PARTNER_BALANCE_AMOUNT_MAX + 1,
    }),
  );
});
