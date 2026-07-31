import assert from "node:assert/strict";
import test from "node:test";

import {
  CONVERT_PARTNER_BALANCE_AMOUNT_MAX,
  convertPartnerBalanceBodySchema,
} from "../src/partnerProgram.js";

test("convertPartnerBalanceBodySchema: accepts amount with idempotencyKey", () => {
  assert.deepEqual(
    convertPartnerBalanceBodySchema.parse({
      amount: 100,
      idempotencyKey: "convert-1",
    }),
    {
      amount: 100,
      idempotencyKey: "convert-1",
    },
  );
});

test("convertPartnerBalanceBodySchema: requires idempotencyKey", () => {
  assert.throws(() => convertPartnerBalanceBodySchema.parse({ amount: 50 }));
});

test("convertPartnerBalanceBodySchema: rejects invalid amount", () => {
  assert.throws(() =>
    convertPartnerBalanceBodySchema.parse({
      amount: 0,
      idempotencyKey: "x",
    }),
  );
  assert.throws(() =>
    convertPartnerBalanceBodySchema.parse({
      amount: CONVERT_PARTNER_BALANCE_AMOUNT_MAX + 1,
      idempotencyKey: "x",
    }),
  );
});
