import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isCompleteDadataAddressSuggestion,
  mapDadataSuggestion,
} from "./mapDadataSuggestion";
import { pickFirstHouseSuggestion } from "./pickFirstHouseSuggestion";

describe("mapDadataSuggestion", () => {
  it("берёт stead_fias_id, когда house_fias_id пустой", () => {
    const mapped = mapDadataSuggestion({
      value: "г Грозный, уч 27а",
      data: {
        house_fias_id: "",
        stead_fias_id: "s1",
        geo_lat: "43.31",
        geo_lon: "45.71",
      },
    });
    assert.equal(mapped.fiasId, "s1");
    assert.equal(mapped.isComplete, true);
  });

  it("дом без ФИАС с номером — complete", () => {
    const suggestion = {
      value: "г Грозный, ул Субры Кишиевой, д 56",
      data: {
        house: "56",
        house_fias_id: "",
        geo_lat: "43.31",
        geo_lon: "45.71",
      },
    };
    const mapped = mapDadataSuggestion(suggestion);
    assert.equal(mapped.fiasId, "");
    assert.equal(mapped.isComplete, true);
    assert.equal(isCompleteDadataAddressSuggestion(suggestion), true);
  });

  it("улица без дома — не complete", () => {
    assert.equal(
      isCompleteDadataAddressSuggestion({
        value: "г Грозный, ул Мира",
        data: { street: "Мира", geo_lat: "43.3", geo_lon: "45.7" },
      }),
      false,
    );
  });
});

describe("pickFirstHouseSuggestion", () => {
  it("предпочитает ФИАС, иначе номер дома", () => {
    const house = {
      value: "дом",
      data: { house_fias_id: "h1", geo_lat: "1", geo_lon: "2" },
    };
    const withoutFias = {
      value: "д 56",
      data: { house: "56", house_fias_id: "", geo_lat: "1", geo_lon: "2" },
    };
    assert.equal(pickFirstHouseSuggestion([withoutFias, house]), house);
    assert.equal(pickFirstHouseSuggestion([withoutFias]), withoutFias);
  });
});
