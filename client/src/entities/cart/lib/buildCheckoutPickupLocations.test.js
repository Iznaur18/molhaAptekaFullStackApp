import { describe, expect, it } from "vitest";

import { buildCheckoutPickupLocations } from "./buildCheckoutPickupLocations.js";

describe("buildCheckoutPickupLocations", () => {
  it("dedupes addresses and collects product titles", () => {
    expect(
      buildCheckoutPickupLocations([
        {
          product: {
            productPickupAddress: "Москва, Тверская 1",
            productName: "Аспирин",
          },
        },
        {
          product: {
            productPickupAddress: "Москва, Тверская 1",
            productName: "Ибупрофен",
          },
        },
        {
          product: {
            productPickupAddress: "Грозный, ул. Кишиевой 56",
            productName: "Витамин C",
          },
        },
      ]),
    ).toEqual([
      {
        address: "Москва, Тверская 1",
        productTitles: ["Аспирин", "Ибупрофен"],
      },
      {
        address: "Грозный, ул. Кишиевой 56",
        productTitles: ["Витамин C"],
      },
    ]);
  });

  it("skips empty addresses", () => {
    expect(
      buildCheckoutPickupLocations([
        { product: { productPickupAddress: "  ", productName: "X" } },
        { product: { productPickupAddress: "A", productName: "" } },
      ]),
    ).toEqual([{ address: "A", productTitles: [] }]);
  });
});
