import assert from "node:assert/strict";
import test from "node:test";

import {
  isBuyNFreeEligible,
  isProductBuyNFreeActive,
  resolveBuyNFreeFreeUnitsForCart,
  resolveBuyNFreeLineTotal,
  resolveBuyNFreePaidQuantity,
} from "../dist/productBuyNFree.js";
import { calculateOrderItemsTotalAmount } from "../dist/orderStatus.js";

test("buy-n-free configured and eligible", () => {
  const product = { productBuyNFreeEnabled: true, productBuyNFreeThreshold: 3 };
  assert.equal(isProductBuyNFreeActive(product), true);
  assert.equal(
    isBuyNFreeEligible({
      product,
      completedPaidOrderCount: 3,
      freeClaimPending: false,
    }),
    true,
  );
  assert.equal(
    isBuyNFreeEligible({
      product,
      completedPaidOrderCount: 3,
      freeClaimPending: true,
    }),
    false,
  );
});

test("free units and line total", () => {
  const product = { productBuyNFreeEnabled: true, productBuyNFreeThreshold: 2 };
  assert.equal(
    resolveBuyNFreeFreeUnitsForCart({
      product,
      completedPaidOrderCount: 2,
      quantity: 3,
    }),
    1,
  );
  assert.equal(resolveBuyNFreePaidQuantity(3, 1), 2);
  assert.equal(resolveBuyNFreeLineTotal({ unitPrice: 100, quantity: 3, freeUnits: 1 }), 200);
  assert.equal(resolveBuyNFreeLineTotal({ unitPrice: 100, quantity: 1, freeUnits: 1 }), 0);
});

test("order total accounts for free units", () => {
  assert.equal(
    calculateOrderItemsTotalAmount([
      { quantity: 2, unitPriceAtOrder: 50, buyNFreeUnitsAtOrder: 1 },
    ]),
    50,
  );
});
