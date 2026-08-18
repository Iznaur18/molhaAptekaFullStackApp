import { describe, expect, it } from "vitest";

import { createProductPickupFieldsFromUser } from "./createProductPickupFieldsFromUser.js";

describe("createProductPickupFieldsFromUser", () => {
  it("copies profile line and geo without apartment", () => {
    expect(
      createProductPickupFieldsFromUser({
        userAddress: "г Грозный, ул Ленина, д 1, кв 5",
        userAddressFlat: "5",
        userAddressFiasId: "fias-1",
        userAddressGeo: { lat: 43.32, lon: 45.69 },
      }),
    ).toEqual({
      productPickupAddress: "г Грозный, ул Ленина, д 1",
      productPickupLat: 43.32,
      productPickupLon: 45.69,
      productPickupSelectedFromSuggest: true,
    });
  });

  it("returns empty pickup fields when profile has no address", () => {
    expect(createProductPickupFieldsFromUser(null)).toEqual({
      productPickupAddress: "",
      productPickupLat: null,
      productPickupLon: null,
      productPickupSelectedFromSuggest: false,
    });
  });
});
