import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mapSuggestionToVerifiedAddress } from "../utils/dadata/verifyRuDeliveryAddress.js";

const context = { line: "введённая строка", flatInput: "" };

/**
 * Реальные ответы подсказок DaData, снятые с прода 2026-08-30, когда
 * выяснилось, что «Стандартизация» у токена отключена (clean → 403), а
 * подсказки координаты знают.
 */
const HOUSE_SUGGESTION = {
  value: "г Грозный, р-н Ахматовский, ул им Мовсара Кишиева, д 26",
  data: {
    city: "Грозный",
    city_district: "Ахматовский",
    street: "им Мовсара Кишиева",
    house: "26",
    house_fias_id: "a04e5e4f-f080-498d-a8a7-47e17c33bf70",
    fias_level: "8",
    qc_geo: "3",
    geo_lat: "43.351446",
    geo_lon: "45.720567",
    region_kladr_id: "2000000000000",
  },
};

const STEAD_SUGGESTION = {
  value: "г Грозный, р-н Ахматовский, ул Хамида Ахмадовича Ахмадова, уч 51",
  data: {
    city: "Грозный",
    city_district: "Ахматовский",
    street: "Хамида Ахмадовича Ахмадова",
    house: null,
    stead: "51",
    stead_fias_id: "bcdb8ab9-be68-43bd-85de-4ca10fbdc3c2",
    fias_level: "75",
    qc_geo: "2",
    geo_lat: "43.314549",
    geo_lon: "45.712516",
    region_kladr_id: "2000000000000",
  },
};

describe("подсказка DaData → проверенный адрес", () => {
  it("принимает дом с координатами", () => {
    const result = mapSuggestionToVerifiedAddress(HOUSE_SUGGESTION, context);

    assert.ok(result);
    assert.equal(result.fiasId, "a04e5e4f-f080-498d-a8a7-47e17c33bf70");
    assert.deepEqual(result.geo, { lat: 43.351446, lon: 45.720567 });
    assert.equal(result.city, "Грозный");
    assert.equal(result.house, "26");
    assert.match(result.displayAddress, /Мовсара Кишиева/);
  });

  it("принимает участок: номер лежит в stead, а не в house", () => {
    const result = mapSuggestionToVerifiedAddress(STEAD_SUGGESTION, context);

    assert.ok(result, "участок с координатами должен приниматься");
    assert.equal(result.fiasId, "bcdb8ab9-be68-43bd-85de-4ca10fbdc3c2");
    assert.deepEqual(result.geo, { lat: 43.314549, lon: 45.712516 });
    assert.equal(result.house, "51");
  });

  it("принимает дом, которого нет в ФИАС — DaData разобрала номер", () => {
    // Снято с прода 2026-09-04: дом есть в адресе и в разборе, но в реестре
    // его нет, поэтому house_fias_id пустой, а координаты — уровня улицы.
    const houseWithoutFias = {
      value: "г Грозный, р-н Ахматовский, ул Субры Кишиевой, д 56",
      data: {
        city: "Грозный",
        settlement: "Ахматовский",
        street: "Субры Кишиевой",
        house: "56",
        house_fias_id: null,
        stead_fias_id: null,
        fias_level: "7",
        qc_geo: "2",
        geo_lat: "43.324728",
        geo_lon: "45.711483",
        region_kladr_id: "2000000000000",
      },
    };

    const result = mapSuggestionToVerifiedAddress(houseWithoutFias, context);

    assert.ok(result, "без координат адрес нельзя сделать точкой отправления");
    assert.equal(result.fiasId, "");
    assert.deepEqual(result.geo, { lat: 43.324728, lon: 45.711483 });
    assert.equal(result.house, "56");
  });

  it("отклоняет адрес до улицы — координаты были бы не те", () => {
    const streetOnly = {
      value: "г Грозный, ул им Мовсара Кишиева",
      data: {
        city: "Грозный",
        street: "им Мовсара Кишиева",
        street_fias_id: "11111111-1111-1111-1111-111111111111",
        geo_lat: "43.35",
        geo_lon: "45.72",
      },
    };

    assert.equal(mapSuggestionToVerifiedAddress(streetOnly, context), null);
  });

  it("отклоняет дом без координат — ради них всё и затевалось", () => {
    const noGeo = {
      value: HOUSE_SUGGESTION.value,
      data: { ...HOUSE_SUGGESTION.data, geo_lat: null, geo_lon: null },
    };

    assert.equal(mapSuggestionToVerifiedAddress(noGeo, context), null);
  });

  it("не падает на пустом ответе", () => {
    assert.equal(mapSuggestionToVerifiedAddress(null, context), null);
    assert.equal(mapSuggestionToVerifiedAddress({}, context), null);
    assert.equal(
      mapSuggestionToVerifiedAddress({ value: "x", data: "не объект" }, context),
      null,
    );
  });
});
