import assert from "node:assert/strict";
import test from "node:test";

import {
  PRODUCT_MANAGE_TOGGLE_KEY_VALUES,
  PRODUCT_MANAGE_TOGGLE_PALETTE,
  PRODUCT_MANAGE_TOGGLE_VARIANT_BY_KEY,
  resolveProductManageToggleKeyFromVariant,
  resolveProductManageTogglePalette,
} from "../dist/productManageToggleDisplay.js";

test("product manage toggle keys match variant map", () => {
  assert.deepEqual(Object.keys(PRODUCT_MANAGE_TOGGLE_VARIANT_BY_KEY).sort(), [
    ...PRODUCT_MANAGE_TOGGLE_KEY_VALUES,
  ].sort());
});

test("resolveProductManageTogglePalette returns checked background", () => {
  const unchecked = resolveProductManageTogglePalette("auction", false);
  const checked = resolveProductManageTogglePalette("auction", true);

  assert.ok(unchecked);
  assert.ok(checked);
  assert.equal(unchecked.background, PRODUCT_MANAGE_TOGGLE_PALETTE.auction.background);
  assert.equal(checked.background, PRODUCT_MANAGE_TOGGLE_PALETTE.auction.backgroundChecked);
});

test("resolveProductManageToggleKeyFromVariant maps visibility to default", () => {
  assert.equal(resolveProductManageToggleKeyFromVariant("default"), "visibility");
  assert.equal(resolveProductManageToggleKeyFromVariant("danger"), null);
});
