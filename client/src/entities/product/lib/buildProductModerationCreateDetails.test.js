import { expect, test } from "vitest";

import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { buildProductModerationCreateDetails } from "./buildProductModerationCreateDetails.js";

test("null / empty product → null", () => {
  expect(buildProductModerationCreateDetails(null)).toBe(null);
  expect(buildProductModerationCreateDetails({})).toBe(null);
});

test("maps create-form fields for staff", () => {
  const details = buildProductModerationCreateDetails({
    _id: "p1",
    productName: "PS5 Pro",
    productListingOrigin: "own",
    productDescription: "# Заголовок\nтело",
    productImageUrls: ["https://cdn.example/a.jpg"],
    productPreviewVideoUrl: "https://cdn.example/v.mp4",
    productPrice: 60000,
    productOldPrice: 78000,
    productCategory: "electronics",
    categoryBreadcrumbRu: "Электроника / Консоли",
    productRegionCode: "RU-MOW",
    productSaleCity: "Москва",
    productStockQuantity: 2,
    loyaltyPointsPerUnit: 150,
    productPickupEnabled: true,
    productDeliveryEnabled: true,
    productReturnEnabled: true,
    productPickupAddress: "Москва, Тверская 1",
    productPickupLat: 55.75,
    productPickupLon: 37.62,
    productCharacteristics: [{ key: "Цвет", value: "Белый" }],
    productReturnTerms: [{ key: "Срок", value: "15 дней" }],
    createdAt: "2026-08-18T20:06:00.000Z",
    productSeller: {
      _id: "u1",
      userName: "iznaur18",
      isPremiumUser: true,
      isUserDataConfirmed: false,
      createdAt: "2025-01-02T00:00:00.000Z",
    },
  });

  expect(details?.heading).toBe("PS5 Pro");
  expect(details?.description).toBe("# Заголовок\nтело");
  expect(details?.previewVideoUrl).toBe("https://cdn.example/v.mp4");
  expect(details?.characteristics).toEqual([{ key: "Цвет", value: "Белый" }]);
  expect(details?.returnTerms).toEqual([{ key: "Срок", value: "15 дней" }]);
  expect(details?.pickup.coordsText).toMatch(/55\.75/);
  expect(details?.pickup.mapsUrl).toBe(
    "https://yandex.ru/maps/?pt=37.62,55.75&z=17&l=map",
  );

  const byKey = Object.fromEntries(details.factRows.map((row) => [row.key, row]));
  expect(byKey.listingOrigin.value).toBe(CREATE_PRODUCT_MODAL_UI.LISTING_ORIGIN_OWN);
  expect(byKey.category.value).toBe("Электроника / Консоли");
  expect(byKey.pickupEnabled.value).toBe("Да");
  expect(byKey.deliveryEnabled.value).toBe("Да");
  expect(byKey.returnEnabled.value).toBe("Да");
  expect(byKey.previewVideo.value).toBe("Да");
  expect(byKey.loyalty.value).toBe("150");

  const sellerByKey = Object.fromEntries(
    details.sellerFactRows.map((row) => [row.key, row]),
  );
  expect(sellerByKey.premium.value).toBe("Да");
  expect(sellerByKey.confirmed.value).toBe("Нет");
  expect(sellerByKey.registeredAt.value).toMatch(/\d{2}\.\d{2}\.\d{4}/);
});

test("address-only pickup builds search maps url", () => {
  const details = buildProductModerationCreateDetails({
    _id: "p2",
    productPickupAddress: "Киров, Ленина 1",
    productPickupEnabled: true,
  });

  expect(details?.pickup.coordsText).toBe(null);
  expect(details?.pickup.mapsUrl).toContain("text=");
  expect(details?.pickup.mapsUrl).toContain(encodeURIComponent("Киров, Ленина 1"));
});
