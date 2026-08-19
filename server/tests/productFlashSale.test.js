import assert from "node:assert/strict";
import test from "node:test";

import {
  PRODUCT_FLASH_SALE_AUCTION_BLOCKED_MESSAGE,
  PRODUCT_FLASH_SALE_MANUAL_DISCOUNT_BLOCKED_MESSAGE,
  resolveProductFlashSaleDurationMinutes,
} from "@molha/api-contract";

import { applyFlashSaleFields } from "../services/product/applyFlashSaleFields.js";
import {
  normalizeExpiredFlashSaleProductFields,
  resolveFlashSaleRestoreBasePrice,
} from "../services/product/productFlashSaleExpiry.js";

test("resolveProductFlashSaleDurationMinutes converts units", () => {
  assert.equal(resolveProductFlashSaleDurationMinutes(2, "hours"), 120);
  assert.equal(resolveProductFlashSaleDurationMinutes(1, "days"), 1440);
  assert.equal(resolveProductFlashSaleDurationMinutes(15, "minutes"), 15);
});

test("applyFlashSaleFields blocks auction", () => {
  const $set = {};
  const $unset = {};
  assert.throws(
    () =>
      applyFlashSaleFields(
        {
          productFlashSaleEnabled: true,
          productFlashSalePrice: 800,
          productFlashSaleDurationValue: 1,
          productFlashSaleDurationUnit: "hours",
        },
        $set,
        $unset,
        {
          productPrice: 1000,
          productAuctionEnabled: true,
          productFlashSaleEnabled: false,
          productOldPrice: null,
        },
      ),
    (error) => error.message === PRODUCT_FLASH_SALE_AUCTION_BLOCKED_MESSAGE,
  );
});

test("applyFlashSaleFields blocks manual discount", () => {
  const $set = {};
  const $unset = {};
  assert.throws(
    () =>
      applyFlashSaleFields(
        {
          productFlashSaleEnabled: true,
          productFlashSalePrice: 800,
          productFlashSaleDurationValue: 30,
          productFlashSaleDurationUnit: "minutes",
        },
        $set,
        $unset,
        {
          productPrice: 900,
          productOldPrice: 1200,
          productAuctionEnabled: false,
          productFlashSaleEnabled: false,
        },
      ),
    (error) => error.message === PRODUCT_FLASH_SALE_MANUAL_DISCOUNT_BLOCKED_MESSAGE,
  );
});

test("applyFlashSaleFields enables flash sale", () => {
  const $set = {};
  const $unset = {};
  applyFlashSaleFields(
    {
      productFlashSaleEnabled: true,
      productFlashSalePrice: 800,
      productFlashSaleDurationValue: 30,
      productFlashSaleDurationUnit: "minutes",
    },
    $set,
    $unset,
    {
      productPrice: 1000,
      productOldPrice: null,
      productAuctionEnabled: false,
      productFlashSaleEnabled: false,
    },
  );
  assert.equal($set.productFlashSaleEnabled, true);
  assert.equal($set.productFlashSaleBasePrice, 1000);
  assert.equal($set.productOldPrice, 1000);
  assert.equal($set.productPrice, 800);
  assert.ok($set.productFlashSaleEndsAt instanceof Date);
});

test("applyFlashSaleFields updates active flash sale without stored base price", () => {
  const $set = {};
  const $unset = {};
  applyFlashSaleFields(
    {
      productFlashSaleEnabled: true,
      productFlashSalePrice: 700,
      productFlashSaleDurationValue: 45,
      productFlashSaleDurationUnit: "minutes",
    },
    $set,
    $unset,
    {
      productPrice: 800,
      productOldPrice: 1000,
      productAuctionEnabled: false,
      productFlashSaleEnabled: true,
      productFlashSaleBasePrice: null,
      productFlashSaleEndsAt: new Date(Date.now() + 60_000),
    },
  );
  assert.equal($set.productFlashSaleBasePrice, 1000);
  assert.equal($set.productPrice, 700);
  assert.equal($set.productFlashSaleDurationMinutes, 45);
});

test("applyFlashSaleFields disables flash sale", () => {
  const $set = {};
  const $unset = {};
  applyFlashSaleFields(
    { productFlashSaleEnabled: false },
    $set,
    $unset,
    {
      productPrice: 800,
      productOldPrice: 1000,
      productFlashSaleEnabled: true,
      productFlashSaleBasePrice: 1000,
      productFlashSaleEndsAt: new Date(Date.now() + 60_000),
    },
  );
  assert.equal($set.productFlashSaleEnabled, false);
  assert.equal($set.productPrice, 1000);
  assert.equal($set.productOldPrice, null);
  assert.equal($unset.productFlashSaleEndsAt, "");
});

test("resolveFlashSaleRestoreBasePrice falls back to productOldPrice", () => {
  assert.equal(
    resolveFlashSaleRestoreBasePrice({
      productPrice: 800,
      productOldPrice: 1000,
      productFlashSaleBasePrice: null,
    }),
    1000,
  );
});

test("normalizeExpiredFlashSaleProductFields restores price for API", () => {
  const normalized = normalizeExpiredFlashSaleProductFields({
    productFlashSaleEnabled: true,
    productFlashSaleEndsAt: new Date(Date.now() - 60_000),
    productFlashSaleBasePrice: null,
    productOldPrice: 1000,
    productPrice: 800,
  });
  assert.equal(normalized.productFlashSaleEnabled, false);
  assert.equal(normalized.productPrice, 1000);
  assert.equal(normalized.productOldPrice, null);
  assert.equal(normalized.discountPercent, undefined);
});
