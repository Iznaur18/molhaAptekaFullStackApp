import assert from "node:assert/strict";
import test from "node:test";

import { PRODUCT_DETAILS_CONTENT_PANEL } from "./productDetailsContentPanelConstants.js";
import { resolveProductDetailsContentPanels } from "./resolveProductDetailsContentPanels.js";

const product = {
  productDescription: "Новый компьютер",
  productCharacteristics: [{ key: "Цвет", value: "Чёрный" }],
};

test("showSwitcher when both description and characteristics exist", () => {
  const panels = resolveProductDetailsContentPanels(product, ["productDescription"]);
  assert.equal(panels.showSwitcher, true);
  assert.equal(panels.defaultPanel, PRODUCT_DETAILS_CONTENT_PANEL.DESCRIPTION);
});

test("only description when characteristics are empty", () => {
  const panels = resolveProductDetailsContentPanels(
    { productDescription: "Текст" },
    ["productDescription"],
  );
  assert.equal(panels.showSwitcher, false);
  assert.equal(panels.hasDescription, true);
  assert.equal(panels.hasCharacteristics, false);
});

test("otherBlockFieldKeys exclude productDescription", () => {
  const panels = resolveProductDetailsContentPanels(product, [
    "productDescription",
    "productImageUrls",
  ]);
  assert.deepEqual(panels.otherBlockFieldKeys, ["productImageUrls"]);
});
