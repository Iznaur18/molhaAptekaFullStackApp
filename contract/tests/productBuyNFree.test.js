import assert from "node:assert/strict";
import test from "node:test";

import {
  PRODUCT_BUY_N_FREE_CONFIG_REQUIRED_MESSAGE,
  PRODUCT_BUY_N_FREE_THRESHOLD_MAX,
  PRODUCT_BUY_N_FREE_THRESHOLD_MIN,
  patchMyProductBodySchema,
} from "../src/index.js";

test("patchMyProductBodySchema accepts buy-n-free fields", () => {
  const parsed = patchMyProductBodySchema.parse({
    productBuyNFreeEnabled: true,
    productBuyNFreeThreshold: 5,
  });
  assert.equal(parsed.productBuyNFreeEnabled, true);
  assert.equal(parsed.productBuyNFreeThreshold, 5);
});

test("patchMyProductBodySchema rejects threshold out of range", () => {
  assert.equal(
    patchMyProductBodySchema.safeParse({ productBuyNFreeThreshold: 1 }).success,
    false,
  );
  assert.equal(
    patchMyProductBodySchema.safeParse({
      productBuyNFreeThreshold: PRODUCT_BUY_N_FREE_THRESHOLD_MAX + 1,
    }).success,
    false,
  );
  assert.equal(PRODUCT_BUY_N_FREE_THRESHOLD_MIN, 2);
});

test("buy-n-free config message is non-empty", () => {
  assert.ok(PRODUCT_BUY_N_FREE_CONFIG_REQUIRED_MESSAGE.length > 0);
});
