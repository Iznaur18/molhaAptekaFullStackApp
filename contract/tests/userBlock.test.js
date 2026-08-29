import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isCatalogProductViewerBlockStateKnown,
  isProductPurchaseBlockedBySeller,
} from "../src/userBlock.js";

describe("userBlock", () => {
  it("isCatalogProductViewerBlockStateKnown — false для seed из каталога", () => {
    assert.equal(isCatalogProductViewerBlockStateKnown({ _id: "1" }), false);
    assert.equal(isCatalogProductViewerBlockStateKnown(null), false);
  });

  it("isCatalogProductViewerBlockStateKnown — true после GET /product/:id/catalog", () => {
    assert.equal(isCatalogProductViewerBlockStateKnown({ isBlockedBySeller: false }), true);
    assert.equal(isCatalogProductViewerBlockStateKnown({ isBlockedBySeller: true }), true);
  });

  it("isProductPurchaseBlockedBySeller — только explicit true", () => {
    assert.equal(isProductPurchaseBlockedBySeller({ isBlockedBySeller: true }), true);
    assert.equal(isProductPurchaseBlockedBySeller({ isBlockedBySeller: false }), false);
    assert.equal(isProductPurchaseBlockedBySeller({ _id: "1" }), false);
  });
});
