import { describe, expect, it } from "vitest";

import { pickFirstHouseSuggestion } from "./pickFirstHouseSuggestion.js";

describe("pickFirstHouseSuggestion", () => {
  it("returns first suggestion with house_fias_id", () => {
    const house = {
      value: "дом",
      data: { house_fias_id: "h1" },
    };
    expect(
      pickFirstHouseSuggestion([
        { value: "улица", data: { street_fias_id: "s1" } },
        house,
      ]),
    ).toBe(house);
  });

  it("returns null when no house", () => {
    expect(pickFirstHouseSuggestion([{ value: "x", data: {} }])).toBeNull();
    expect(pickFirstHouseSuggestion([])).toBeNull();
  });
});

describe("адрес на участке", () => {
  it("годится: дома у участка нет, идентификатор лежит в stead", () => {
    const stead = {
      value: "г Грозный, ул Хамида Ахмадовича Ахмадова, уч 27а",
      data: { house_fias_id: "", stead_fias_id: "s1" },
    };
    const street = { value: "г Грозный, ул Мира", data: {} };

    expect(pickFirstHouseSuggestion([street, stead])).toBe(stead);
  });

  it("улица без дома и участка по-прежнему не подходит", () => {
    expect(
      pickFirstHouseSuggestion([{ value: "г Грозный, ул Мира", data: {} }]),
    ).toBeNull();
  });

  it("дом без ФИАС, но с номером и координатами — годится", () => {
    const withoutFias = {
      value: "г Грозный, ул Субры Кишиевой, д 56",
      data: {
        house: "56",
        house_fias_id: "",
        geo_lat: "43.31",
        geo_lon: "45.71",
      },
    };
    expect(pickFirstHouseSuggestion([withoutFias])).toBe(withoutFias);
  });
});
