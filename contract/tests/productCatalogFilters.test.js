import assert from "node:assert/strict";
import { test } from "node:test";

import {
  PRODUCT_CATALOG_PRICE_RANGE_INVALID_MESSAGE,
  catalogProductFacetsDataSchema,
  catalogProductsQuerySchema,
} from "../src/productCatalog.js";

test("delivery: CSV и повторы параметра → массив без дублей", () => {
  assert.deepEqual(
    catalogProductsQuerySchema.parse({ delivery: "seller, courier,seller" }).delivery,
    ["seller", "courier"],
  );
  assert.deepEqual(
    catalogProductsQuerySchema.parse({ delivery: ["carrier", "seller"] }).delivery,
    ["carrier", "seller"],
  );
  assert.equal(catalogProductsQuerySchema.parse({ delivery: "" }).delivery, undefined);
});

test("delivery: неизвестный способ получения отклоняется", () => {
  assert.equal(
    catalogProductsQuerySchema.safeParse({ delivery: "teleport" }).success,
    false,
  );
});

test("цена: строки из адреса → целые рубли, «от» не больше «до»", () => {
  const parsed = catalogProductsQuerySchema.parse({ priceMin: "50", priceMax: "300" });
  assert.equal(parsed.priceMin, 50);
  assert.equal(parsed.priceMax, 300);

  const reversed = catalogProductsQuerySchema.safeParse({
    priceMin: "500",
    priceMax: "100",
  });
  assert.equal(reversed.success, false);
  assert.equal(
    reversed.error.issues[0].message,
    PRODUCT_CATALOG_PRICE_RANGE_INVALID_MESSAGE,
  );

  assert.equal(catalogProductsQuerySchema.safeParse({ priceMin: "-1" }).success, false);
  assert.equal(
    catalogProductsQuerySchema.safeParse({ priceMax: "12.5" }).success,
    false,
  );
  assert.equal(
    catalogProductsQuerySchema.safeParse({ priceMax: "дёшево" }).success,
    false,
  );
});

test("ratingMin — только 3, 4 или 5", () => {
  assert.equal(catalogProductsQuerySchema.parse({ ratingMin: "4" }).ratingMin, 4);
  assert.equal(catalogProductsQuerySchema.safeParse({ ratingMin: "2" }).success, false);
});

test("новые сортировки и флаги принимаются, старые sort=premium/confirmed — тоже", () => {
  for (const sort of [
    "price_asc",
    "price_desc",
    "rating",
    "discount",
    "premium",
    "confirmed",
  ]) {
    assert.equal(catalogProductsQuerySchema.parse({ sort }).sort, sort);
  }

  const flags = catalogProductsQuerySchema.parse({
    pickupOnly: "true",
    withReviews: "true",
    returnOnly: "false",
    sellerConfirmed: "true",
    sellerPremium: "true",
  });
  assert.equal(flags.pickupOnly, true);
  assert.equal(flags.withReviews, true);
  assert.equal(flags.returnOnly, false);
  assert.equal(flags.sellerConfirmed, true);
  assert.equal(flags.sellerPremium, true);
});

test("ответ фасетов: счётчики «Рядом» и подписок бывают null, цена — при пустой выдаче", () => {
  const facets = {
    total: 3,
    price: { min: 5, p25: 10, p50: 20, p75: 30, p90: 40, max: 50 },
    categories: [{ id: "66f0a1", label: "Молочные продукты", count: 3 }],
    options: {
      delivery: { seller: 3, courier: 0, carrier: 0 },
      pickupOnly: 0,
      ratingMin4: 0,
      withReviews: 0,
      saleOnly: 1,
      flashSaleOnly: 0,
      installmentOnly: 0,
      wholesaleOnly: 0,
      buyNFreeOnly: 0,
      rentalOnly: 0,
      auctionOnly: 0,
      affiliateOnly: 0,
      originalOnly: 0,
      returnOnly: 0,
      sellerConfirmed: 3,
      sellerPremium: 0,
      followingOnly: null,
      near: null,
    },
  };

  assert.equal(catalogProductFacetsDataSchema.safeParse(facets).success, true);
  assert.equal(
    catalogProductFacetsDataSchema.safeParse({
      ...facets,
      total: 0,
      price: null,
      categories: [],
    }).success,
    true,
  );
});
