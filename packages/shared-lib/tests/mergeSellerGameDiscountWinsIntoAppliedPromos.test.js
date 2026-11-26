import assert from "node:assert/strict";
import { test } from "node:test";

import {
  mergeSellerGameDiscountWinsIntoAppliedPromos,
  pickMostExpensiveProductIdBySeller,
} from "../dist/mergeSellerGameDiscountWinsIntoAppliedPromos.js";

test("pickMostExpensiveProductIdBySeller: дороже и tie-break по id", () => {
  const map = pickMostExpensiveProductIdBySeller([
    { productId: "p2", sellerId: "s1", productPrice: 100 },
    { productId: "p1", sellerId: "s1", productPrice: 500 },
    { productId: "p3", sellerId: "s1", productPrice: 500 },
    { productId: "q1", sellerId: "s2", productPrice: 10 },
  ]);
  assert.equal(map.get("s1"), "p1"); // 500, id меньше p3
  assert.equal(map.get("s2"), "q1");
});

test("merge: скидка только на самый дорогой товар продавца", () => {
  const result = mergeSellerGameDiscountWinsIntoAppliedPromos(
    [],
    [{ sellerId: "s1", discountPercent: 20 }],
    [
      { productId: "cheap", sellerId: "s1", productPrice: 100 },
      { productId: "pricey", sellerId: "s1", productPrice: 900 },
      { productId: "other", sellerId: "s2", productPrice: 999 },
    ],
    "FORTUNEWHEEL",
  );
  assert.deepEqual(result, [
    { productId: "pricey", code: "FORTUNEWHEEL", discountPercent: 20 },
  ]);
});

test("merge: prizeProductId не даёт скидку", () => {
  const result = mergeSellerGameDiscountWinsIntoAppliedPromos(
    [],
    [{ sellerId: "s1", discountPercent: 40, prizeProductId: "prize" }],
    [{ productId: "p1", sellerId: "s1", productPrice: 100 }],
    "LUCKYBOX",
  );
  assert.deepEqual(result, []);
});

test("merge: не перебивает более сильный обычный промо", () => {
  const result = mergeSellerGameDiscountWinsIntoAppliedPromos(
    [{ productId: "pricey", code: "BIG", discountPercent: 50 }],
    [{ sellerId: "s1", discountPercent: 20 }],
    [
      { productId: "cheap", sellerId: "s1", productPrice: 100 },
      { productId: "pricey", sellerId: "s1", productPrice: 900 },
    ],
    "LUCKYBOX",
  );
  assert.deepEqual(result, [{ productId: "pricey", code: "BIG", discountPercent: 50 }]);
});

test("merge: лучший выигрыш на продавца", () => {
  const result = mergeSellerGameDiscountWinsIntoAppliedPromos(
    [],
    [
      { sellerId: "s1", discountPercent: 10 },
      { sellerId: "s1", discountPercent: 35 },
    ],
    [{ productId: "p1", sellerId: "s1", productPrice: 200 }],
    "FORTUNEWHEEL",
  );
  assert.deepEqual(result, [
    { productId: "p1", code: "FORTUNEWHEEL", discountPercent: 35 },
  ]);
});
