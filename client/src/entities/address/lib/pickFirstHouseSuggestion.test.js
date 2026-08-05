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
