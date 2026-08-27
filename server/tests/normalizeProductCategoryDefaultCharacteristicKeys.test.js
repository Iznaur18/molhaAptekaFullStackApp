import assert from "node:assert/strict";
import test from "node:test";

import { PRODUCT_CHARACTERISTICS_MAX_ITEMS } from "../constants/productCharacteristicsConstants.js";
import { AppError } from "../errors/AppError.js";
import { normalizeProductCategoryDefaultCharacteristicKeys } from "../services/product/normalizeProductCategoryDefaultCharacteristicKeys.js";

test("normalizeProductCategoryDefaultCharacteristicKeys trims, drops empty, dedupes", () => {
  assert.deepEqual(
    normalizeProductCategoryDefaultCharacteristicKeys([
      " Цвет ",
      "",
      "цвет",
      "ОЗУ",
      "  ",
    ]),
    ["Цвет", "ОЗУ"],
  );
});

test("normalizeProductCategoryDefaultCharacteristicKeys returns [] for nullish", () => {
  assert.deepEqual(normalizeProductCategoryDefaultCharacteristicKeys(null), []);
  assert.deepEqual(normalizeProductCategoryDefaultCharacteristicKeys(undefined), []);
});

test("normalizeProductCategoryDefaultCharacteristicKeys rejects non-array", () => {
  assert.throws(
    () => normalizeProductCategoryDefaultCharacteristicKeys("Цвет"),
    (err) => err instanceof AppError && err.statusCode === 400,
  );
});

test("normalizeProductCategoryDefaultCharacteristicKeys rejects overlong key", () => {
  assert.throws(
    () => normalizeProductCategoryDefaultCharacteristicKeys(["x".repeat(51)]),
    (err) => err instanceof AppError && err.statusCode === 400,
  );
});

test("normalizeProductCategoryDefaultCharacteristicKeys rejects keys over the limit", () => {
  // Лимит берём из константы: a9073eb9 поднял его с 10 до 20, а зашитое
  // в тест число осталось прежним — проверка падала на верном коде.
  const keys = Array.from(
    { length: PRODUCT_CHARACTERISTICS_MAX_ITEMS + 1 },
    (_, i) => `K${i}`,
  );
  assert.throws(
    () => normalizeProductCategoryDefaultCharacteristicKeys(keys),
    (err) => err instanceof AppError && err.statusCode === 400,
  );
});

test("normalizeProductCategoryDefaultCharacteristicKeys accepts exactly the limit", () => {
  const keys = Array.from({ length: PRODUCT_CHARACTERISTICS_MAX_ITEMS }, (_, i) => `K${i}`);
  assert.equal(
    normalizeProductCategoryDefaultCharacteristicKeys(keys).length,
    PRODUCT_CHARACTERISTICS_MAX_ITEMS,
  );
});
