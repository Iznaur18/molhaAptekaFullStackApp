import assert from "node:assert/strict";
import test from "node:test";

import {
  PRODUCT_WHOLESALE_CONFIG_REQUIRED_MESSAGE,
  PRODUCT_WHOLESALE_PRICE_MUST_BE_LOWER_MESSAGE,
  patchMyProductBodySchema,
} from "../src/index.js";

test("patchMyProductBodySchema accepts wholesale fields", () => {
  const parsed = patchMyProductBodySchema.parse({
    productWholesaleEnabled: true,
    productWholesaleMinQty: 5,
    productWholesalePrice: 900,
  });
  assert.equal(parsed.productWholesaleEnabled, true);
  assert.equal(parsed.productWholesaleMinQty, 5);
  assert.equal(parsed.productWholesalePrice, 900);
});

test("patchMyProductBodySchema rejects minQty below 2", () => {
  const result = patchMyProductBodySchema.safeParse({
    productWholesaleMinQty: 1,
  });
  assert.equal(result.success, false);
});

test("wholesale messages are non-empty", () => {
  assert.ok(PRODUCT_WHOLESALE_CONFIG_REQUIRED_MESSAGE.length > 0);
  assert.ok(PRODUCT_WHOLESALE_PRICE_MUST_BE_LOWER_MESSAGE.length > 0);
});
