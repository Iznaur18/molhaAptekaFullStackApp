import { describe, expect, it } from "vitest";

import { createProductPickupFieldsFromUser } from "./createProductPickupFieldsFromUser.js";

describe("createProductPickupFieldsFromUser", () => {
  it("does not prefill pickup locations from profile", () => {
    const result = createProductPickupFieldsFromUser({
      userAddress: "г Грозный, ул Ленина, д 1",
      userAddressFlat: "5",
      userAddressFiasId: "fias-1",
      userAddressGeo: { lat: 43.32, lon: 45.69 },
      userAddresses: [
        {
          id: "home-1",
          line: "г Москва, ул Рабочая, д 89А стр 1",
          isDefault: true,
          geo: { lat: 55.75, lon: 37.62 },
        },
        {
          id: "home-2",
          line: "г Грозный, р-н Ахматовский, ул имени Эсет Кишиевой, д 28А к 2",
          isDefault: false,
        },
      ],
    });

    expect(result).toEqual({
      productPickupLocations: [],
      productPickupAddress: "",
      productPickupLat: null,
      productPickupLon: null,
      productPickupSelectedFromSuggest: false,
    });
  });

  it("returns empty pickup fields when profile is missing", () => {
    expect(createProductPickupFieldsFromUser(null)).toEqual({
      productPickupLocations: [],
      productPickupAddress: "",
      productPickupLat: null,
      productPickupLon: null,
      productPickupSelectedFromSuggest: false,
    });
  });
});
