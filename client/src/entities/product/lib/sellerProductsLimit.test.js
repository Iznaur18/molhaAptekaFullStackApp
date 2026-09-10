import { describe, expect, test } from "vitest";

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
    expect(getSellerProductsLimit({})).toBe(SELLER_PRODUCTS_LIMIT_REGULAR);
    expect(getSellerProductsLimit({ isPremiumUser: true })).toBe(
      SELLER_PRODUCTS_LIMIT_PREMIUM,
    );
  });

  test("персональный override сильнее premium", () => {
    expect(
      getSellerProductsLimit({
        isPremiumUser: true,
        sellerProductsLimitOverride: 20000,
      }),
    ).toBe(20000);
    expect(
      getSellerProductsLimit({
        sellerProductsLimitOverride: SELLER_PRODUCTS_LIMIT_UNLIMITED,
      }),
    ).toBe(SELLER_PRODUCTS_LIMIT_UNLIMITED);
  });

  test("isSellerProductsLimitReached учитывает unlimited", () => {
    expect(isSellerProductsLimitReached(50, 50)).toBe(true);
    expect(isSellerProductsLimitReached(20000, 100)).toBe(false);
    expect(isSellerProductsLimitReached(SELLER_PRODUCTS_LIMIT_UNLIMITED, 99999)).toBe(
      false,
    );
  });

  test("formatSellerProductsQuota для unlimited", () => {
    expect(formatSellerProductsQuota(12, 50)).toBe("12 / 50");
    expect(formatSellerProductsQuota(12, SELLER_PRODUCTS_LIMIT_UNLIMITED)).toBe(
      "12 / ∞",
    );
  });
});
