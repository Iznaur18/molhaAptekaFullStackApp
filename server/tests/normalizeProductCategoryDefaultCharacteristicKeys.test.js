import assert from "node:assert/strict";
import test from "node:test";

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

test("normalizeProductCategoryDefaultCharacteristicKeys rejects more than 10 keys", () => {
  const keys = Array.from({ length: 11 }, (_, i) => `K${i}`);
  assert.throws(
    () => normalizeProductCategoryDefaultCharacteristicKeys(keys),
    (err) => err instanceof AppError && err.statusCode === 400,
  );
});
