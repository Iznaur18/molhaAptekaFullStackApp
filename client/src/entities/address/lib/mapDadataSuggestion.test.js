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
      regionCode: null,
      isComplete: true,
    });
  });

  it("maps region_iso_code to RU region", () => {
    const result = mapDadataSuggestion({
      value: "г Москва, ул Ленина, д 1",
      data: {
        house_fias_id: "abc-123",
        geo_lat: "55.75",
        geo_lon: "37.62",
        region_iso_code: "RU-MOW",
      },
    });
    expect(result.regionCode).toBe("RU-MOW");
  });

  it("не берёт street-level fias_id без house_fias_id", () => {
    const result = mapDadataSuggestion({
      value: "Адрес",
      data: {
        fias_id: "fallback-fias",
        geo_lat: "n/a",
        geo_lon: "37.62",
      },
    });

    expect(result.fiasId).toBe("");
    expect(result.geo).toBeNull();
  });
});

describe("адрес на участке", () => {
  it("идентификатор берётся из stead, когда дома нет", () => {
    const mapped = mapDadataSuggestion({
      value: "г Грозный, ул Хамида Ахмадовича Ахмадова, уч 27а",
      data: {
        house_fias_id: "",
        stead_fias_id: "s1",
        geo_lat: "43.31",
        geo_lon: "45.71",
      },
    });

    expect(mapped.fiasId).toBe("s1");
    expect(mapped.geo).toEqual({ lat: 43.31, lon: 45.71 });
    expect(mapped.isComplete).toBe(true);
  });
});

describe("дом без ФИАС", () => {
  it("принимает разобранный номер дома с координатами", () => {
    const mapped = mapDadataSuggestion({
      value: "г Грозный, ул Субры Кишиевой, д 56",
      data: {
        house: "56",
        house_fias_id: "",
        geo_lat: "43.31",
        geo_lon: "45.71",
      },
    });

    expect(mapped.fiasId).toBe("");
    expect(mapped.isComplete).toBe(true);
    expect(mapped.geo).toEqual({ lat: 43.31, lon: 45.71 });
  });
});
