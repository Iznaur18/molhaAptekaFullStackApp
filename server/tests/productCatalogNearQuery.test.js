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

  it("no-location bucket requires viewer region + no pickup point", () => {
    const match = buildNearNoLocationMatch(
      {
        productModerationStatus: "approved",
        productStockQuantity: { $gt: 0 },
      },
      "RU-CE",
    );

    assert.equal(match.$and.length, 4);
    assert.deepEqual(match.$and[0], {
      productModerationStatus: "approved",
      productStockQuantity: { $gt: 0 },
    });
    assert.deepEqual(match.$and[1], { productPickupEnabled: { $ne: false } });
    assert.deepEqual(match.$and[2], { productRegionCode: "RU-CE" });
    assert.ok(match.$and[3].$or);
  });

  it("no-location bucket is empty without viewer region", () => {
    const match = buildNearNoLocationMatch(
      { productModerationStatus: "approved" },
      null,
    );

    assert.deepEqual(match.$and[1], { _id: { $exists: false } });
  });
});
