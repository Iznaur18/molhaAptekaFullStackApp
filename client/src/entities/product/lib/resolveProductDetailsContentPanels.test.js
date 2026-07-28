import { expect, test } from "vitest";

import { PRODUCT_DETAILS_CONTENT_PANEL } from "./productDetailsContentPanelConstants.js";
import { resolveProductDetailsContentPanels } from "./resolveProductDetailsContentPanels.js";

const product = {
  productDescription: "Новый компьютер",
  productCharacteristics: [{ key: "Цвет", value: "Чёрный" }],
};

test("showSwitcher when both description and characteristics exist", () => {
  const panels = resolveProductDetailsContentPanels(product, ["productDescription"]);
  expect(panels.showSwitcher).toBe(true);
  expect(panels.defaultPanel).toBe(PRODUCT_DETAILS_CONTENT_PANEL.DESCRIPTION);
});

test("showSwitcher when only description exists", () => {
  const panels = resolveProductDetailsContentPanels(
    { productDescription: "Текст" },
    ["productDescription"],
  );
  expect(panels.showSwitcher).toBe(true);
  expect(panels.hasDescription).toBe(true);
  expect(panels.hasCharacteristics).toBe(false);
});

test("otherBlockFieldKeys exclude productDescription", () => {
  const panels = resolveProductDetailsContentPanels(product, [
    "productDescription",
    "_id",
  ]);
  expect(panels.otherBlockFieldKeys).toEqual(["_id"]);
});
