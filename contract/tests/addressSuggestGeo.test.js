import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  dadataSuggestionGeo,
  dadataSuggestionObjectFiasId,
  hasDadataSuggestionHouseNumber,
  pickAddressSuggestionForGeo,
} from "../src/addressSuggest.js";

/** Дом из ФИАС: координаты точные. */
const HOUSE_IN_FIAS = {
  value: "г Грозный, р-н Ахматовский, ул им Мовсара Кишиева, д 26",
  data: {
    house: "26",
    house_fias_id: "a04e5e4f-f080-498d-a8a7-47e17c33bf70",
    geo_lat: "43.351446",
    geo_lon: "45.720567",
  },
};

/** Участок: номер в `stead`, `house_fias_id` — пустая строка, а не null. */
const STEAD = {
  value: "г Грозный, ул Хамида Ахмадовича Ахмадова, уч 51",
  data: {
    house: null,
    house_fias_id: "",
    stead: "51",
    stead_fias_id: "bcdb8ab9-be68-43bd-85de-4ca10fbdc3c2",
    geo_lat: "43.314549",
    geo_lon: "45.712516",
  },
};

/** Дома нет в реестре: разбор есть, идентификатора нет, координаты улицы. */
const HOUSE_WITHOUT_FIAS = {
  value: "г Грозный, р-н Ахматовский, ул Субры Кишиевой, д 56",
  data: {
    house: "56",
    house_fias_id: null,
    stead_fias_id: null,
    geo_lat: "43.324728",
    geo_lon: "45.711483",
  },
};

const STREET_ONLY = {
  value: "г Грозный, ул Субры Кишиевой",
  data: {
    house: null,
    street_fias_id: "688f13ae-595e-4a8d-82b3-30dd0a6da377",
    geo_lat: "43.32",
    geo_lon: "45.71",
  },
};

describe("подсказка DaData → координаты", () => {
  it("идентификатор объекта: дом, участок, ничего", () => {
    assert.equal(
      dadataSuggestionObjectFiasId(HOUSE_IN_FIAS.data),
      "a04e5e4f-f080-498d-a8a7-47e17c33bf70",
    );
    assert.equal(
      dadataSuggestionObjectFiasId(STEAD.data),
      "bcdb8ab9-be68-43bd-85de-4ca10fbdc3c2",
    );
    assert.equal(dadataSuggestionObjectFiasId(HOUSE_WITHOUT_FIAS.data), "");
    assert.equal(dadataSuggestionObjectFiasId(null), "");
  });

  it("разобранный номер дома видно и без ФИАС", () => {
    assert.equal(hasDadataSuggestionHouseNumber(HOUSE_WITHOUT_FIAS.data), true);
    assert.equal(hasDadataSuggestionHouseNumber(STEAD.data), true);
    assert.equal(hasDadataSuggestionHouseNumber(STREET_ONLY.data), false);
  });

  it("пустая координата не превращается в ноль", () => {
    assert.deepEqual(dadataSuggestionGeo(HOUSE_IN_FIAS.data), {
      lat: 43.351446,
      lon: 45.720567,
    });
    assert.equal(dadataSuggestionGeo({ geo_lat: "", geo_lon: "" }), null);
    assert.equal(dadataSuggestionGeo({ geo_lat: null, geo_lon: "45.7" }), null);
    assert.equal(dadataSuggestionGeo({ geo_lat: "нет", geo_lon: "45.7" }), null);
  });

  it("объект из ФИАС предпочтительнее разбора", () => {
    assert.equal(
      pickAddressSuggestionForGeo([STREET_ONLY, HOUSE_IN_FIAS]),
      HOUSE_IN_FIAS,
    );
    assert.equal(pickAddressSuggestionForGeo([STEAD]), STEAD);
  });

  it("дом не из ФИАС всё равно даёт координаты", () => {
    assert.equal(
      pickAddressSuggestionForGeo([HOUSE_WITHOUT_FIAS]),
      HOUSE_WITHOUT_FIAS,
    );
  });

  it("адрес до улицы не берём — это центр улицы, а не дом", () => {
    assert.equal(pickAddressSuggestionForGeo([STREET_ONLY]), null);
    assert.equal(pickAddressSuggestionForGeo([]), null);
    assert.equal(pickAddressSuggestionForGeo(null), null);
  });

  it("дом без координат бесполезен", () => {
    assert.equal(
      pickAddressSuggestionForGeo([
        { value: "x", data: { house: "1", geo_lat: null, geo_lon: null } },
      ]),
      null,
    );
  });
});
