import { describe, expect, it } from "vitest";

import { addressValueFromUser } from "./addressValueFromUser.js";

describe("addressValueFromUser", () => {
  it("marks saved address as selected from suggest", () => {
    const value = addressValueFromUser({
      userAddress: "г Москва, ул Ленина, д 1, кв 5",
      userAddressFlat: "5",
      userAddressFiasId: "fias-1",
      userAddressGeo: { lat: 55.75, lon: 37.62 },
    });

    expect(value).toEqual({
      line: "г Москва, ул Ленина, д 1",
      flat: "",
      fiasId: "fias-1",
      geo: { lat: 55.75, lon: 37.62 },
      selectedFromSuggest: true,
    });
  });

  it("returns empty draft for missing profile address", () => {
    expect(addressValueFromUser({})).toEqual({
      line: "",
      flat: "",
      fiasId: "",
      geo: null,
      selectedFromSuggest: false,
    });
  });
});
