import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  SELLER_PRODUCTS_LIMIT_PREMIUM,
  SELLER_PRODUCTS_LIMIT_REGULAR,
  SELLER_PRODUCTS_LIMIT_UNLIMITED,
} from "@molha/api-contract";

import {
  formatSellerProductsQuota,
  getSellerProductsLimit,
  isSellerProductsLimitReached,
} from "./sellerProductsLimit.js";

describe("getSellerProductsLimit (client)", () => {
  test("без override — regular / premium", () => {
    assert.equal(getSellerProductsLimit({}), SELLER_PRODUCTS_LIMIT_REGULAR);
    assert.equal(
      getSellerProductsLimit({ isPremiumUser: true }),
      SELLER_PRODUCTS_LIMIT_PREMIUM,
    );
  });

  test("персональный override сильнее premium", () => {
    assert.equal(
      getSellerProductsLimit({
        isPremiumUser: true,
        sellerProductsLimitOverride: 20000,
      }),
      20000,
    );
    assert.equal(
      getSellerProductsLimit({
        sellerProductsLimitOverride: SELLER_PRODUCTS_LIMIT_UNLIMITED,
      }),
      SELLER_PRODUCTS_LIMIT_UNLIMITED,
    );
  });

  test("isSellerProductsLimitReached учитывает unlimited", () => {
    assert.equal(isSellerProductsLimitReached(50, 50), true);
    assert.equal(isSellerProductsLimitReached(20000, 100), false);
    assert.equal(
      isSellerProductsLimitReached(SELLER_PRODUCTS_LIMIT_UNLIMITED, 99999),
      false,
    );
  });

  test("formatSellerProductsQuota для unlimited", () => {
    assert.equal(formatSellerProductsQuota(12, 50), "12 / 50");
    assert.equal(
      formatSellerProductsQuota(12, SELLER_PRODUCTS_LIMIT_UNLIMITED),
      "12 / ∞",
    );
  });
});
