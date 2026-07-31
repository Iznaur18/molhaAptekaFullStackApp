import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  PRODUCT_DELIVERY_FULFILLMENT_ENABLED,
  PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE,
  PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE,
  createProductBodySchema,
  createOrderBodySchema,
  doProductsSupportPickup,
  doProductsSupportSellerDelivery,
  resolveCartLineFulfillmentSection,
  CART_FULFILLMENT_SECTION_PICKUP,
  CART_FULFILLMENT_SECTION_DELIVERY,
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

  it("rejects create when no fulfillment method selected", () => {
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
      productPickupEnabled: false,
      productDeliveryEnabled: false,
    });
    assert.equal(parsed.success, false);
    if (!parsed.success) {
      assert.ok(
        parsed.error.issues.some(
          (issue) => issue.message === PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE,
        ),
      );
    }
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
      idempotencyKey: "order-key-1",
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
      idempotencyKey: "order-key-2",
    });
    assert.equal(parsed.success, false);
  });

  it("exposes required message constant", () => {
    assert.ok(PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE.length > 0);
  });

  it("enables seller delivery fulfillment flag", () => {
    assert.equal(PRODUCT_DELIVERY_FULFILLMENT_ENABLED, true);
  });

  it("doProductsSupportSellerDelivery requires every product", () => {
    assert.equal(doProductsSupportSellerDelivery([]), false);
    assert.equal(
      doProductsSupportSellerDelivery([{ productDeliveryEnabled: true }]),
      true,
    );
    assert.equal(
      doProductsSupportSellerDelivery([
        { productDeliveryEnabled: true },
        { productDeliveryEnabled: false },
      ]),
      false,
    );
  });

  it("doProductsSupportPickup defaults enabled and requires address", () => {
    assert.equal(doProductsSupportPickup([]), false);
    assert.equal(
      doProductsSupportPickup([{ productPickupAddress: "Москва, Тверская 1" }]),
      true,
    );
    assert.equal(
      doProductsSupportPickup([
        { productPickupEnabled: false, productPickupAddress: "Москва, Тверская 1" },
      ]),
      false,
    );
    assert.equal(
      doProductsSupportPickup([{ productPickupEnabled: true, productPickupAddress: "" }]),
      false,
    );
  });

  it("resolveCartLineFulfillmentSection: dual→pickup, delivery-only→delivery", () => {
    assert.equal(
      resolveCartLineFulfillmentSection({
        productPickupEnabled: true,
        productDeliveryEnabled: true,
      }),
      CART_FULFILLMENT_SECTION_PICKUP,
    );
    assert.equal(
      resolveCartLineFulfillmentSection({
        productPickupEnabled: false,
        productDeliveryEnabled: true,
      }),
      CART_FULFILLMENT_SECTION_DELIVERY,
    );
    assert.equal(
      resolveCartLineFulfillmentSection({}),
      CART_FULFILLMENT_SECTION_PICKUP,
    );
  });
});
