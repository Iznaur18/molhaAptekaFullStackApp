import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  attachCatalogDistanceMeters,
  haversineDistanceMeters,
  pickProductPickupPoint,
} from "../services/product/attachCatalogDistanceMeters.js";

describe("attachCatalogDistanceMeters", () => {
  it("haversine ~0 for same point", () => {
    assert.ok(haversineDistanceMeters(55.75, 37.62, 55.75, 37.62) < 1);
  });

  it("picks lat/lon fields", () => {
    assert.deepEqual(
      pickProductPickupPoint({ productPickupLat: 43.28, productPickupLon: 45.68 }),
      { lat: 43.28, lon: 45.68 },
    );
  });

  it("picks GeoJSON [lon,lat]", () => {
    assert.deepEqual(
      pickProductPickupPoint({
        productPickupLocation: { type: "Point", coordinates: [45.68, 43.28] },
      }),
      { lat: 43.28, lon: 45.68 },
    );
  });

  it("attaches distanceMeters for any range (not capped at 30km)", () => {
    const [enriched] = attachCatalogDistanceMeters(
      [{ _id: "1", productPickupLat: 55.0, productPickupLon: 37.0 }],
      { lat: 56.0, lon: 38.0 },
    );
    assert.ok(Number.isFinite(enriched.distanceMeters));
    assert.ok(enriched.distanceMeters > 30_000);
  });

  it("skips products without pickup point", () => {
    const [enriched] = attachCatalogDistanceMeters(
      [{ _id: "1", productName: "x" }],
      { lat: 55.75, lon: 37.62 },
    );
    assert.equal(enriched.distanceMeters, undefined);
  });

  it("keeps existing distanceMeters from near query", () => {
    const [enriched] = attachCatalogDistanceMeters(
      [
        {
          _id: "1",
          productPickupLat: 55.0,
          productPickupLon: 37.0,
          distanceMeters: 1234,
        },
      ],
      { lat: 56.0, lon: 38.0 },
    );
    assert.equal(enriched.distanceMeters, 1234);
  });
});
