import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatCatalogNearDistanceLabel,
  splitCatalogNearProducts,
} from "../src/productCatalog.js";

describe("formatCatalogNearDistanceLabel", () => {
  it("formats sub-10 km with one decimal, min 0.1", () => {
    assert.equal(formatCatalogNearDistanceLabel(50), "~0.1 км");
    assert.equal(formatCatalogNearDistanceLabel(1200), "~1.2 км");
    assert.equal(formatCatalogNearDistanceLabel(9999), "~10.0 км");
  });

  it("formats >=10 km as integers", () => {
    assert.equal(formatCatalogNearDistanceLabel(10_000), "~10 км");
    assert.equal(formatCatalogNearDistanceLabel(12_400), "~12 км");
  });

  it("rejects invalid", () => {
    assert.equal(formatCatalogNearDistanceLabel(null), null);
    assert.equal(formatCatalogNearDistanceLabel(-1), null);
  });
});

describe("splitCatalogNearProducts", () => {
  it("splits by finite distanceMeters", () => {
    const { withDistance, withoutDistance } = splitCatalogNearProducts([
      { _id: "a", distanceMeters: 100 },
      { _id: "b" },
      { _id: "c", distanceMeters: null },
    ]);
    assert.deepEqual(
      withDistance.map((p) => p._id),
      ["a"],
    );
    assert.deepEqual(
      withoutDistance.map((p) => p._id),
      ["b", "c"],
    );
  });
});
