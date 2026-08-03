import { describe, expect, it } from "vitest";

import {
  PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE,
  PRODUCT_PICKUP_ADDRESS_MIN_LENGTH,
  PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE,
} from "@molha/api-contract";

import { CREATE_PRODUCT_INITIAL_FORM } from "./createProductFormState.js";
import { createImageRow } from "./productImageRowHelpers.js";
import { prepareCreateProductSubmit } from "./prepareCreateProductSubmit.js";

const baseForm = {
  ...CREATE_PRODUCT_INITIAL_FORM,
  productName: "Тестовый товар",
  productListingOrigin: "own",
  productIsOriginal: true,
  productDescription: "Описание товара достаточно длинное для валидации",
  productImageRows: [createImageRow("/uploads/a.jpg")],
  productPrice: "1000",
  productCategory: "electronics",
  productCategoryId: "507f1f77bcf86cd799439011",
  productRegionCode: "RU-MOW",
  productReturnEnabled: false,
  productPickupAddress: "Москва, Тверская улица, 1",
  productPickupLat: 55.75,
  productPickupLon: 37.62,
};

describe("prepareCreateProductSubmit pickup", () => {
  it("requires pickup address", () => {
    const result = prepareCreateProductSubmit({
      form: { ...baseForm, productPickupAddress: "" },
      isEdit: false,
      showCatalogAvailabilityToggle: true,
      sellerPointsMaxPerUnit: 100,
      sellerCatalogCommitted: 0,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe(PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE);
    }
  });

  it("rejects when no fulfillment method selected", () => {
    const result = prepareCreateProductSubmit({
      form: {
        ...baseForm,
        productPickupEnabled: false,
        productDeliveryEnabled: false,
      },
      isEdit: false,
      showCatalogAvailabilityToggle: true,
      sellerPointsMaxPerUnit: 100,
      sellerCatalogCommitted: 0,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe(PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE);
    }
  });

  it("requires pickup coords", () => {
    const result = prepareCreateProductSubmit({
      form: { ...baseForm, productPickupLat: null, productPickupLon: null },
      isEdit: false,
      showCatalogAvailabilityToggle: true,
      sellerPointsMaxPerUnit: 100,
      sellerCatalogCommitted: 0,
    });
    expect(result.ok).toBe(false);
  });

  it("includes pickup fields in createBody", () => {
    const result = prepareCreateProductSubmit({
      form: baseForm,
      isEdit: false,
      showCatalogAvailabilityToggle: true,
      sellerPointsMaxPerUnit: 100,
      sellerCatalogCommitted: 0,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.createBody?.productPickupAddress.length).toBeGreaterThanOrEqual(
        PRODUCT_PICKUP_ADDRESS_MIN_LENGTH,
      );
      expect(result.createBody?.productPickupLat).toBe(55.75);
      expect(result.createBody?.productPickupLon).toBe(37.62);
      expect(result.createBody?.productPickupEnabled).toBe(true);
      expect(result.createBody?.productDeliveryEnabled).toBe(false);
    }
  });

  it("passes productDeliveryEnabled when seller enables delivery", () => {
    const result = prepareCreateProductSubmit({
      form: { ...baseForm, productDeliveryEnabled: true },
      isEdit: false,
      showCatalogAvailabilityToggle: true,
      sellerPointsMaxPerUnit: 100,
      sellerCatalogCommitted: 0,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.createBody?.productDeliveryEnabled).toBe(true);
      expect(result.createBody?.productPickupEnabled).toBe(true);
    }
  });

  it("allows delivery-only listing", () => {
    const result = prepareCreateProductSubmit({
      form: {
        ...baseForm,
        productPickupEnabled: false,
        productDeliveryEnabled: true,
      },
      isEdit: true,
      showCatalogAvailabilityToggle: true,
      sellerPointsMaxPerUnit: 100,
      sellerCatalogCommitted: 0,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.patchBody?.productPickupEnabled).toBe(false);
      expect(result.patchBody?.productDeliveryEnabled).toBe(true);
    }
  });
});
