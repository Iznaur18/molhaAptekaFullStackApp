import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildProductPickupLocation,
  normalizeProductPickupAddress,
  normalizeProductPickupCoords,
  resolveProductDeliveryEnabledForWrite,
} from "../services/product/productPickup.js";
describe("productPickup service", () => {
  it("normalizes address", () => {
    assert.equal(
      normalizeProductPickupAddress("  Москва, Тверская 1  "),
      "Москва, Тверская 1",
    );
  });

  it("rejects short address", () => {
    assert.throws(() => normalizeProductPickupAddress("abc"), /адрес продажи/);
  });

  it("builds GeoJSON Point as [lon, lat]", () => {
    assert.deepEqual(buildProductPickupLocation(55.75, 37.62), {
      type: "Point",
      coordinates: [37.62, 55.75],
    });
    assert.equal(buildProductPickupLocation(null, 37.62), null);
  });

  it("normalizes coord pair with pickup location", () => {
    assert.deepEqual(normalizeProductPickupCoords(55.75, 37.62), {
      productPickupLat: 55.75,
      productPickupLon: 37.62,
      productPickupLocation: {
        type: "Point",
        coordinates: [37.62, 55.75],
      },
    });
  });

  it("clears location when coords empty", () => {
    assert.deepEqual(normalizeProductPickupCoords(null, null), {
      productPickupLat: null,
      productPickupLon: null,
      productPickupLocation: null,
    });
  });

  it("rejects unpaired coords", () => {
    assert.throws(() => normalizeProductPickupCoords(55.75, null), /широту/);
  });

  it("allows seller delivery when fulfillment flag enabled", () => {
    assert.equal(resolveProductDeliveryEnabledForWrite(false), false);
    assert.equal(resolveProductDeliveryEnabledForWrite(true), true);
  });
});
