import assert from "node:assert/strict";
import test from "node:test";

import {
  getProductNonEmptyCharacteristics,
  hasProductCharacteristicsContent,
  hasProductDescriptionContent,
} from "../dist/productDetailsContent.js";

test("hasProductDescriptionContent ignores blank description", () => {
  assert.equal(hasProductDescriptionContent({ productDescription: "   " }), false);
  assert.equal(hasProductDescriptionContent({ productDescription: "Новый компьютер" }), true);
});

test("getProductNonEmptyCharacteristics filters incomplete rows", () => {
  assert.deepEqual(
    getProductNonEmptyCharacteristics([
      { key: "Цвет", value: "Чёрный" },
      { key: "  ", value: "Пустой ключ" },
      { name: "Размер", value: "L" },
      { key: "Вес", value: "" },
    ]),
    [
      { key: "Цвет", value: "Чёрный" },
      { key: "Размер", value: "L" },
    ],
  );
});

test("hasProductCharacteristicsContent requires non-empty pairs", () => {
  assert.equal(
    hasProductCharacteristicsContent({
      productCharacteristics: [{ key: "Цвет", value: "Чёрный" }],
    }),
    true,
  );
  assert.equal(
    hasProductCharacteristicsContent({
      productCharacteristics: [{ key: "Цвет", value: " " }],
    }),
    false,
  );
});
