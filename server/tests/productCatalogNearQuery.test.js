import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildNearGeoQuery,
  buildNearNoLocationMatch,
} from "../services/product/productCatalogNearQuery.js";

describe("productCatalogNearQuery match builders", () => {
  it("geo query requires pickup-eligible products", () => {
    assert.deepEqual(
      buildNearGeoQuery({ productModerationStatus: "approved" }),
      {
        productModerationStatus: "approved",
        productPickupEnabled: { $ne: false },
      },
    );
  });

  it("no-location bucket wraps base in $and", () => {
    const match = buildNearNoLocationMatch({
      productModerationStatus: "approved",
      productStockQuantity: { $gt: 0 },
    });

    assert.equal(match.$and.length, 3);
    assert.deepEqual(match.$and[0], {
      productModerationStatus: "approved",
      productStockQuantity: { $gt: 0 },
    });
    assert.deepEqual(match.$and[1], { productPickupEnabled: { $ne: false } });
    assert.ok(match.$and[2].$or);
  });
});
