import assert from "node:assert/strict";
import test from "node:test";

import {
  computeProductHasActivePromoCodes,
  mergePromoCodesForReplace,
} from "../services/product/productPromoCode.js";

test("mergePromoCodesForReplace keeps activationsUsed and caps active", () => {
  const next = mergePromoCodesForReplace(
    [
      {
        code: "sale10",
        discountPercent: 10,
        enabled: true,
        maxActivations: 100,
      },
    ],
    [
      {
        _id: "abc",
        code: "SALE10",
        discountPercent: 5,
        enabled: true,
        maxActivations: 50,
        activationsUsed: 12,
      },
    ],
  );
  assert.equal(next.length, 1);
  assert.equal(next[0].code, "SALE10");
  assert.equal(next[0].activationsUsed, 12);
  assert.equal(next[0].discountPercent, 10);
  assert.equal(computeProductHasActivePromoCodes(next), true);
});

test("mergePromoCodesForReplace auto-disables exhausted codes", () => {
  const next = mergePromoCodesForReplace(
    [
      {
        code: "gone",
        discountPercent: 10,
        enabled: true,
        maxActivations: 5,
      },
    ],
    [{ code: "GONE", activationsUsed: 5, maxActivations: 5, enabled: true }],
  );
  assert.equal(next[0].enabled, false);
  assert.equal(computeProductHasActivePromoCodes(next), false);
});
