import { describe, expect, it } from "vitest";

import { resolveMapGeolocatePick } from "./resolveMapGeolocatePick.js";

describe("resolveMapGeolocatePick", () => {
  it("prefers house_fias_id", () => {
    const house = { value: "дом", data: { house_fias_id: "h1" } };
    expect(
      resolveMapGeolocatePick([{ value: "улица", data: {} }, house]),
    ).toEqual({ suggestion: house, isHouse: true });
  });

  it("falls back to first suggestion without house", () => {
    const street = { value: "г Москва, ул Ленина", data: {} };
    expect(resolveMapGeolocatePick([street])).toEqual({
      suggestion: street,
      isHouse: false,
    });
  });

  it("returns null for empty", () => {
    expect(resolveMapGeolocatePick([])).toBeNull();
  });
});
