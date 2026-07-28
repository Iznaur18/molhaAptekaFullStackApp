import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE,
  createProductBodySchema,
  createOrderBodySchema,
} from "../src/index.js";

describe("productPickup + order fulfillment", () => {
  it("requires pickup address on create", () => {
    const parsed = createProductBodySchema.safeParse({
      productName: "Тестовый товар",
      productDescription: "Описание товара достаточно длинное",
      productImageUrls: ["/uploads/a.jpg"],
      productPrice: 100,
      productIsAvailable: true,
      productListingOrigin: "own",
      productIsOriginal: true,
      productCategory: "electronics",
      productRegionCode: "RU-MOW",
    });
    assert.equal(parsed.success, false);
  });

  it("accepts create with pickup address", () => {
    const parsed = createProductBodySchema.safeParse({
      productName: "Тестовый товар",
      productDescription: "Описание товара достаточно длинное",
      productImageUrls: ["/uploads/a.jpg"],
      productPrice: 100,
      productIsAvailable: true,
      productListingOrigin: "own",
      productIsOriginal: true,
      productCategory: "electronics",
      productRegionCode: "RU-MOW",
      productPickupAddress: "Москва, Тверская 1",
      productPickupLat: 55.75,
      productPickupLon: 37.62,
    });
    assert.equal(parsed.success, true);
  });

  it("rejects unpaired coords", () => {
    const parsed = createProductBodySchema.safeParse({
      productName: "Тестовый товар",
      productDescription: "Описание товара достаточно длинное",
      productImageUrls: ["/uploads/a.jpg"],
      productPrice: 100,
      productIsAvailable: true,
      productListingOrigin: "own",
      productIsOriginal: true,
      productCategory: "electronics",
      productRegionCode: "RU-MOW",
      productPickupAddress: "Москва, Тверская 1",
      productPickupLat: 55.75,
    });
    assert.equal(parsed.success, false);
  });

  it("defaults order fulfillment to pickup without delivery address", () => {
    const parsed = createOrderBodySchema.safeParse({
      items: [{ productId: "507f1f77bcf86cd799439011", quantity: 1 }],
      paymentMethod: "cashOnDelivery",
    });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.fulfillmentMethod, "pickup");
    }
  });

  it("requires delivery address when fulfillment is delivery", () => {
    const parsed = createOrderBodySchema.safeParse({
      items: [{ productId: "507f1f77bcf86cd799439011", quantity: 1 }],
      paymentMethod: "cashOnDelivery",
      fulfillmentMethod: "delivery",
      deliveryAddress: "",
    });
    assert.equal(parsed.success, false);
  });

  it("exposes required message constant", () => {
    assert.ok(PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE.length > 0);
  });
});
