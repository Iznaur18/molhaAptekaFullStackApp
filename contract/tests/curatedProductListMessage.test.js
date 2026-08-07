import assert from "node:assert/strict";
import { test } from "node:test";

import {
  formatCuratedProductRegionMismatchMessage,
  formatCuratedRegionLabel,
} from "../src/curatedProductList.js";

test("formatCuratedRegionLabel uses human region name", () => {
  assert.match(formatCuratedRegionLabel("RU-MOW"), /Москва/i);
});

test("formatCuratedProductRegionMismatchMessage includes both region labels", () => {
  const message = formatCuratedProductRegionMismatchMessage("RU-CE", "RU-MOW");
  assert.match(message, /Регион товара \(.+\) не совпадает с регионом подборки \(.+\)/);
  assert.match(message, /Москва/i);
});
