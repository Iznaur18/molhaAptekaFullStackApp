import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  normalizeProductPickupAddress,
  normalizeProductPickupCoords,
  resolveProductDeliveryEnabledForWrite,
} from "../services/product/productPickup.js";
import { AppError } from "../errors/AppError.js";

describe("productPickup service", () => {
  it("normalizes address", () => {
    assert.equal(
      normalizeProductPickupAddress("  Москва, Тверская 1  "),
      "Москва, Тверская 1",
    );
  });

  it("rejects short address", () => {
    assert.throws(() => normalizeProductPickupAddress("abc"), /самовывоза/);
  });

  it("normalizes coord pair", () => {
    assert.deepEqual(normalizeProductPickupCoords(55.75, 37.62), {
      productPickupLat: 55.75,
      productPickupLon: 37.62,
    });
  });

  it("rejects unpaired coords", () => {
    assert.throws(() => normalizeProductPickupCoords(55.75, null), /широту/);
  });

  it("forces delivery disabled", () => {
    assert.equal(resolveProductDeliveryEnabledForWrite(false), false);
    assert.throws(
      () => resolveProductDeliveryEnabledForWrite(true),
      (error) => error instanceof AppError && error.statusCode === 400,
    );
  });
});
