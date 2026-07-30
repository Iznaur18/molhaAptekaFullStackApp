import assert from "node:assert/strict";
import test from "node:test";

import {
  formatProductWholesaleBadgeLabel,
  isProductWholesaleConfigured,
  resolveProductUnitPrice,
  resolveProductWholesaleOffer,
} from "../dist/productWholesale.js";

test("resolveProductUnitPrice uses wholesale when enabled and qty met", () => {
  assert.equal(
    resolveProductUnitPrice({
      productPrice: 1000,
      productWholesaleEnabled: true,
      productWholesaleMinQty: 5,
      productWholesalePrice: 800,
      quantity: 5,
    }),
    800,
  );
  assert.equal(
    resolveProductUnitPrice({
      productPrice: 1000,
      productWholesaleEnabled: true,
      productWholesaleMinQty: 5,
      productWholesalePrice: 800,
      quantity: 4,
    }),
    1000,
  );
});

test("resolveProductUnitPrice ignores wholesale when disabled", () => {
  assert.equal(
    resolveProductUnitPrice({
      productPrice: 1000,
      productWholesaleEnabled: false,
      productWholesaleMinQty: 5,
      productWholesalePrice: 800,
      quantity: 10,
    }),
    1000,
  );
});

test("isProductWholesaleConfigured requires price below retail", () => {
  assert.equal(
    isProductWholesaleConfigured({
      productPrice: 1000,
      productWholesaleMinQty: 2,
      productWholesalePrice: 1000,
    }),
    false,
  );
  assert.equal(
    isProductWholesaleConfigured({
      productPrice: 1000,
      productWholesaleMinQty: 2,
      productWholesalePrice: 900,
    }),
    true,
  );
});

test("formatProductWholesaleBadgeLabel", () => {
  const label = formatProductWholesaleBadgeLabel({
    productPrice: 1000,
    productWholesaleEnabled: true,
    productWholesaleMinQty: 10,
    productWholesalePrice: 700,
  });
  assert.ok(label);
  assert.match(label, /^От 10 шт — /);
  assert.match(label, /700/);
  assert.equal(
    formatProductWholesaleBadgeLabel({
      productPrice: 1000,
      productWholesaleEnabled: false,
      productWholesaleMinQty: 10,
      productWholesalePrice: 700,
    }),
    null,
  );
});

test("resolveProductWholesaleOffer", () => {
  const offer = resolveProductWholesaleOffer({
    productPrice: 1000,
    productWholesaleEnabled: true,
    productWholesaleMinQty: 10,
    productWholesalePrice: 700,
  });
  assert.deepEqual(offer, {
    minQty: 10,
    wholesalePrice: 700,
    retailPrice: 1000,
    savingsPerUnit: 300,
    discountPercent: 30,
  });
  assert.equal(
    resolveProductWholesaleOffer({
      productPrice: 1000,
      productWholesaleEnabled: false,
      productWholesaleMinQty: 10,
      productWholesalePrice: 700,
    }),
    null,
  );
});
