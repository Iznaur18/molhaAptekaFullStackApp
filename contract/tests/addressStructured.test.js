import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildAddressLineFromStructured,
  normalizeRuCityKey,
  normalizeRuCityLabel,
  ruCityLabelsEqual,
} from "../src/addressStructured.js";

describe("buildAddressLineFromStructured", () => {
  it("собирает строку для DaData", () => {
    assert.equal(
      buildAddressLineFromStructured({
        city: "г Москва",
        district: "Центральный",
        street: "ул Ленина",
        house: "10",
      }),
      "г Москва, Центральный, ул Ленина, д 10",
    );
  });

  it("не дублирует префикс дома", () => {
    assert.equal(
      buildAddressLineFromStructured({
        city: "Казань",
        street: "ул Баумана",
        house: "д 5",
      }),
      "Казань, ул Баумана, д 5",
    );
  });
});

describe("ruCityLabelsEqual", () => {
  it("сравнивает города без учёта регистра и префикса", () => {
    assert.equal(ruCityLabelsEqual("Москва", "москва"), true);
    assert.equal(ruCityLabelsEqual("г Москва", "Москва"), true);
    assert.equal(ruCityLabelsEqual("Москва", "Казань"), false);
    assert.equal(ruCityLabelsEqual("", "Москва"), false);
    assert.equal(normalizeRuCityLabel("  Москва "), "Москва");
    assert.equal(normalizeRuCityKey("г Москва"), "москва");
    assert.equal(normalizeRuCityKey("  Город Казань "), "казань");
  });
});
