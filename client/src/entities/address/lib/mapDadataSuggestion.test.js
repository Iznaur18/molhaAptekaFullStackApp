import { describe, expect, it } from "vitest";

import { mapDadataSuggestion } from "./mapDadataSuggestion.js";

describe("mapDadataSuggestion", () => {
  it("maps value, fias and geo from house_fias_id", () => {
    const result = mapDadataSuggestion({
      value: "  г Москва, ул Ленина, д 1 ",
      unrestrictedValue: "г Москва, ул Ленина, д 1",
      data: {
        house_fias_id: "abc-123",
        geo_lat: "55.75",
        geo_lon: "37.62",
      },
    });

    expect(result).toEqual({
      line: "г Москва, ул Ленина, д 1",
      fiasId: "abc-123",
      geo: { lat: 55.75, lon: 37.62 },
    });
  });

  it("falls back to fias_id and null geo when coords invalid", () => {
    const result = mapDadataSuggestion({
      value: "Адрес",
      data: {
        fias_id: "fallback-fias",
        geo_lat: "n/a",
        geo_lon: "37.62",
      },
    });

    expect(result.fiasId).toBe("fallback-fias");
    expect(result.geo).toBeNull();
  });
});
