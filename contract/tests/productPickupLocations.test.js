import assert from "node:assert/strict";
import { test } from "node:test";

import {
  PRODUCT_PICKUP_LOCATIONS_MAX,
  createProductBodySchema,
  productPickupLocationsFromProduct,
  syncLegacyPickupFieldsFromLocations,
  ensureSingleDefaultProductPickupLocation,
  createOrderBodySchema,
} from "../src/index.js";

test("productPickupLocationsFromProduct falls back to legacy scalars", () => {
  const locations = productPickupLocationsFromProduct({
    productPickupAddress: "Москва, Тверская улица, д 1",
    productPickupLat: 55.75,
    productPickupLon: 37.62,
  });
  assert.equal(locations.length, 1);
  assert.equal(locations[0].isDefault, true);
  assert.equal(locations[0].address, "Москва, Тверская улица, д 1");
});

test("syncLegacyPickupFieldsFromLocations uses default", () => {
  const synced = syncLegacyPickupFieldsFromLocations([
    {
      id: "a",
      address: "Москва, Арбат, д 2",
      lat: 1,
      lon: 2,
      isDefault: false,
    },
    {
      id: "b",
      address: "Москва, Тверская, д 1",
      lat: 3,
      lon: 4,
      isDefault: true,
    },
  ]);
  assert.equal(synced.productPickupAddress, "Москва, Тверская, д 1");
  assert.equal(synced.productPickupLat, 3);
  assert.equal(synced.productPickupLon, 4);
});

test("createProductBodySchema accepts productPickupLocations", () => {
  const parsed = createProductBodySchema.safeParse({
    productName: "Тестовый товар длинный",
    productDescription: "Описание товара достаточно длинное",
    productImageUrls: ["https://cdn.example/a.jpg"],
    productPrice: 100,
    productCategory: "pharmacy",
    productIsAvailable: true,
    productListingOrigin: "own",
    productPickupLocations: [
      {
        id: "loc-1",
        label: "Склад",
        address: "Москва, Тверская улица, д 1",
        lat: 55.75,
        lon: 37.62,
        isDefault: true,
      },
    ],
  });
  assert.equal(parsed.success, true);
});

test("createOrderBodySchema accepts pickupSelections", () => {
  const parsed = createOrderBodySchema.safeParse({
    items: [{ productId: "507f1f77bcf86cd799439011", quantity: 1 }],
    paymentMethod: "cashOnDelivery",
    idempotencyKey: "key-1",
    pickupSelections: [
      {
        productId: "507f1f77bcf86cd799439011",
        pickupLocationId: "loc-1",
      },
    ],
  });
  assert.equal(parsed.success, true);
});

test("ensureSingleDefaultProductPickupLocation caps default to one", () => {
  const next = ensureSingleDefaultProductPickupLocation([
    { id: "1", isDefault: true },
    { id: "2", isDefault: true },
  ]);
  assert.equal(next.filter((item) => item.isDefault).length, 1);
  assert.equal(PRODUCT_PICKUP_LOCATIONS_MAX, 5);
});
