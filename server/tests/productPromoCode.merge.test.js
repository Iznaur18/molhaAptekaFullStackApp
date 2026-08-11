import assert from "node:assert/strict";
import test from "node:test";

import {
  collectOrderedProductIdsWithPromo,
  computeProductHasActivePromoCodes,
  isProductPromoActivationSpentByOrder,
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

test("collectOrderedProductIdsWithPromo only includes lines with promo snapshot", () => {
  assert.deepEqual(
    collectOrderedProductIdsWithPromo([
      { productId: "p1", promoCodeAtOrder: "APPLE" },
      { productId: "p2", promoCodeAtOrder: null },
      { productId: "p3", promoCodeAtOrder: "" },
      { productId: "p1", promoCodeAtOrder: "APPLE" },
    ]),
    ["p1"],
  );
  assert.deepEqual(collectOrderedProductIdsWithPromo([]), []);
  assert.deepEqual(collectOrderedProductIdsWithPromo(null), []);
});

test("isProductPromoActivationSpentByOrder: only older-or-equal activations are spent", () => {
  const orderAt = Date.parse("2026-08-11T12:00:00.000Z");
  assert.equal(
    isProductPromoActivationSpentByOrder({
      activatedAt: Date.parse("2026-08-11T11:00:00.000Z"),
      orderAt,
    }),
    true,
  );
  assert.equal(
    isProductPromoActivationSpentByOrder({
      activatedAt: orderAt,
      orderAt,
    }),
    true,
  );
  assert.equal(
    isProductPromoActivationSpentByOrder({
      activatedAt: Date.parse("2026-08-11T13:00:00.000Z"),
      orderAt,
    }),
    false,
  );
});
