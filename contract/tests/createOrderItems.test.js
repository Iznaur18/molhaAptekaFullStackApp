import assert from "node:assert/strict";
import test from "node:test";

import { createOrderBodySchema } from "../src/order.js";

const PRODUCT_A = "507f1f77bcf86cd799439011";
const PRODUCT_B = "507f1f77bcf86cd799439012";

const baseBody = {
  paymentMethod: "cashOnDelivery",
  idempotencyKey: "idem-1",
  fulfillmentMethod: "pickup",
};

test("createOrderBodySchema отклоняет дубликат productId в items", () => {
  const result = createOrderBodySchema.safeParse({
    ...baseBody,
    items: [
      { productId: PRODUCT_A, quantity: 1 },
      { productId: PRODUCT_A, quantity: 1 },
    ],
  });

  assert.equal(result.success, false);
  assert.match(result.error.issues[0].message, /дважды/);
  assert.deepEqual(result.error.issues[0].path, ["items", 1, "productId"]);
});

test("createOrderBodySchema пропускает одну позицию с количеством > 1", () => {
  const result = createOrderBodySchema.safeParse({
    ...baseBody,
    items: [{ productId: PRODUCT_A, quantity: 3 }],
  });

  assert.equal(result.success, true);
  assert.equal(result.data.items[0].quantity, 3);
});

test("createOrderBodySchema пропускает разные товары", () => {
  const result = createOrderBodySchema.safeParse({
    ...baseBody,
    items: [
      { productId: PRODUCT_A, quantity: 1 },
      { productId: PRODUCT_B, quantity: 2 },
    ],
  });

  assert.equal(result.success, true);
});

test("createOrderBodySchema отклоняет две точки самовывоза для одного товара", () => {
  const result = createOrderBodySchema.safeParse({
    ...baseBody,
    items: [{ productId: PRODUCT_A, quantity: 1 }],
    pickupSelections: [
      { productId: PRODUCT_A, pickupLocationId: "loc-1" },
      { productId: PRODUCT_A, pickupLocationId: "loc-2" },
    ],
  });

  assert.equal(result.success, false);
  assert.match(result.error.issues[0].message, /несколько точек/);
});
