import { expect, test } from "vitest";

import { PRODUCT_DETAILS_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { formatProductFieldForDisplay } from "./formatProductFieldForDisplay.js";
import {
  isProductFieldMultilineRead,
  PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS,
} from "./productFieldRegistry.js";

test("details top row shows pickup address instead of region", () => {
  expect(PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS).toContain("productPickupAddress");
  expect(PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS).not.toContain("productRegionCode");
  expect(isProductFieldMultilineRead("productPickupAddress")).toBe(true);
});

test("productPickupAddress formats address and empty placeholder", () => {
  expect(
    formatProductFieldForDisplay("productPickupAddress", {
      productPickupAddress: "  Киров, ул Ленина, д 1  ",
    }),
  ).toBe("Киров, ул Ленина, д 1");

  expect(
    formatProductFieldForDisplay("productPickupAddress", {
      productPickupAddress: "   ",
    }),
  ).toBe(PRODUCT_DETAILS_MODAL_UI.ADDRESS_EMPTY);

  expect(formatProductFieldForDisplay("productPickupAddress", {})).toBe(
    PRODUCT_DETAILS_MODAL_UI.ADDRESS_EMPTY,
  );
});
