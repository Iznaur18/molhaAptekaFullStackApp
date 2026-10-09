import assert from "node:assert/strict";
import test from "node:test";

import { buildLeafCategoryPathLabels } from "../services/product/resolveProductCategoryWrite.js";

test("путь узла уже кончается его названием — повтора нет", () => {
  assert.deepEqual(
    buildLeafCategoryPathLabels({
      pathLabelRu: ["Кафе и рестораны", "Пицца"],
      labelRu: "Пицца",
    }),
    ["Кафе и рестораны", "Пицца"],
  );
});

test("старый узел без себя в пути — название дописывается", () => {
  assert.deepEqual(
    buildLeafCategoryPathLabels({ pathLabelRu: ["Аптека"], labelRu: "Витамины" }),
    ["Аптека", "Витамины"],
  );
});

test("одноимённые родитель и ребёнок не схлопываются, если путь уже полный", () => {
  assert.deepEqual(
    buildLeafCategoryPathLabels({
      pathLabelRu: ["Одежда", "Обувь", "Обувь"],
      labelRu: "Обувь",
    }),
    ["Одежда", "Обувь", "Обувь"],
  );
});

test("корень-лист и пустые части", () => {
  assert.deepEqual(buildLeafCategoryPathLabels({ pathLabelRu: [], labelRu: "Цветы" }), [
    "Цветы",
  ]);
  assert.deepEqual(
    buildLeafCategoryPathLabels({ pathLabelRu: ["Дом", " ", null], labelRu: "" }),
    ["Дом"],
  );
  assert.deepEqual(buildLeafCategoryPathLabels(null), []);
});
