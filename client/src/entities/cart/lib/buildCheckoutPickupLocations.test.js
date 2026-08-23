import { describe, expect, it } from "vitest";

import {
  buildCheckoutPickupLocations,
  flattenCheckoutPickupAddresses,
  resolveInitialPickupSelections,
} from "./buildCheckoutPickupLocations.js";

describe("buildCheckoutPickupLocations", () => {
  it("groups locations per product", () => {
    expect(
      buildCheckoutPickupLocations([
        {
          product: {
            _id: "p1",
            productPickupAddress: "Москва, Тверская 1",
            productPickupLat: 55.75,
            productPickupLon: 37.62,
            productName: "Аспирин",
          },
        },
        {
          product: {
            _id: "p2",
            productPickupAddress: "Грозный, ул. Кишиевой 56",
            productPickupLat: 43.3,
            productPickupLon: 45.7,
            productName: "Витамин C",
          },
        },
      ]),
    ).toEqual([
      {
        productId: "p1",
        productTitle: "Аспирин",
        locations: [
          {
            id: "legacy-default",
            label: "",
            address: "Москва, Тверская 1",
            lat: 55.75,
            lon: 37.62,
            isDefault: true,
          },
        ],
      },
      {
        productId: "p2",
        productTitle: "Витамин C",
        locations: [
          {
            id: "legacy-default",
            label: "",
            address: "Грозный, ул. Кишиевой 56",
            lat: 43.3,
            lon: 45.7,
            isDefault: true,
          },
        ],
      },
    ]);
  });

  it("skips empty addresses", () => {
    expect(
      buildCheckoutPickupLocations([
        { product: { _id: "p1", productPickupAddress: "  ", productName: "X" } },
        {
          product: {
            _id: "p2",
            productPickupAddress: "Адрес длиннее пяти",
            productPickupLat: 1,
            productPickupLon: 2,
            productName: "",
          },
        },
      ]),
    ).toEqual([
      {
        productId: "p2",
        productTitle: "",
        locations: [
          {
            id: "legacy-default",
            label: "",
            address: "Адрес длиннее пяти",
            lat: 1,
            lon: 2,
            isDefault: true,
          },
        ],
      },
    ]);
  });

  it("flattens selected addresses for summary", () => {
    const groups = buildCheckoutPickupLocations([
      {
        product: {
          _id: "p1",
          productName: "A",
          productPickupLocations: [
            {
              id: "a",
              address: "Москва, Тверская 1",
              lat: 1,
              lon: 2,
              isDefault: true,
            },
            {
              id: "b",
              address: "Москва, Арбат 2",
              lat: 3,
              lon: 4,
              isDefault: false,
            },
          ],
        },
      },
    ]);
    const selected = resolveInitialPickupSelections(groups);
    expect(selected).toEqual({ p1: "a" });
    expect(flattenCheckoutPickupAddresses(groups, { p1: "b" })).toEqual([
      { address: "Москва, Арбат 2", productTitles: ["A"] },
    ]);
  });
});
