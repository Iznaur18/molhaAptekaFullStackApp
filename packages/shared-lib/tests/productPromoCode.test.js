import assert from "node:assert/strict";
import test from "node:test";

import {
  applyPromoPercentToRetailPrice,
  resolveProductUnitPriceWithPromo,
} from "@izibuy/shared-lib";

test("applyPromoPercentToRetailPrice floors and clamps", () => {
  assert.equal(applyPromoPercentToRetailPrice(1000, 10), 900);
  assert.equal(applyPromoPercentToRetailPrice(999, 10), 899);
  assert.equal(applyPromoPercentToRetailPrice(1000, 0), 1000);
  assert.equal(applyPromoPercentToRetailPrice(1, 99), 1);
});

test("resolveProductUnitPriceWithPromo takes min of wholesale and promo", () => {
  assert.equal(
    resolveProductUnitPriceWithPromo({
      productPrice: 1000,
      productWholesaleEnabled: true,
      productWholesaleMinQty: 2,
      productWholesalePrice: 800,
      quantity: 2,
      promoDiscountPercent: 10,
    }),
    800,
  );
  assert.equal(
    resolveProductUnitPriceWithPromo({
      productPrice: 1000,
      productWholesaleEnabled: true,
      productWholesaleMinQty: 2,
      productWholesalePrice: 800,
      quantity: 2,
      promoDiscountPercent: 50,
    }),
    500,
  );
  assert.equal(
    resolveProductUnitPriceWithPromo({
      productPrice: 1000,
      quantity: 1,
      promoDiscountPercent: 20,
    }),
    800,
  );
});
