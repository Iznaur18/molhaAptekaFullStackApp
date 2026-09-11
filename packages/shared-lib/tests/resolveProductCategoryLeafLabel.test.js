import assert from "node:assert/strict";
import test from "node:test";

import { resolveProductCategoryLeafLabel } from "../dist/resolveProductCategoryLeafLabel.js";

test("resolveProductCategoryLeafLabel: leaf from › breadcrumb", () => {
  assert.equal(
    resolveProductCategoryLeafLabel("Продукты питания › Напитки › Энергетики"),
    "Энергетики",
  );
});

test("resolveProductCategoryLeafLabel: leaf from > breadcrumb", () => {
  assert.equal(resolveProductCategoryLeafLabel("Продукты > Энергетики"), "Энергетики");
});

test("resolveProductCategoryLeafLabel: single segment", () => {
  assert.equal(resolveProductCategoryLeafLabel("Энергетики"), "Энергетики");
});

test("resolveProductCategoryLeafLabel: empty", () => {
  assert.equal(resolveProductCategoryLeafLabel(""), null);
  assert.equal(resolveProductCategoryLeafLabel("   "), null);
  assert.equal(resolveProductCategoryLeafLabel(null), null);
});
