import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { pruneCartDeselection } from "../entities/cart/lib/pruneCartDeselection.ts";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("pruneCartDeselection drops ids that left the cart", () => {
  const pruned = pruneCartDeselection(new Set(["a", "gone"]), new Set(["a", "b"]));

  assert.deepEqual([...pruned], ["a"]);
});

test("pruneCartDeselection keeps the same set reference when nothing to drop", () => {
  const deselected = new Set(["a"]);

  assert.equal(pruneCartDeselection(deselected, new Set(["a", "b"])), deselected);
});

test("cart line renders a selection checkbox in the card corner", () => {
  const lineItem = readMobileFile("entities/cart/ui/CartLineItem.tsx");
  const styles = readMobileFile("shared/theme/commerceScreenStyles.ts");

  assert.match(lineItem, /AppCheckbox/);
  assert.match(lineItem, /checked=\{selected\}/);
  assert.match(lineItem, /onToggleSelected\(line\.productId\)/);
  assert.match(styles, /selectCheckbox: \{\s*position: "absolute",\s*top: 12,\s*right: 12,/);
});

test("checkout orders only the selected lines and keeps the rest in the cart", () => {
  const cartScreen = readMobileFile("app/(tabs)/cart.tsx");

  assert.match(cartScreen, /items: activeSummary\.selectedLines\.map/);
  assert.match(cartScreen, /await removeItems\(orderedProductIds\)/);
  assert.doesNotMatch(cartScreen, /items: activeSummary\.purchasableLines\.map/);
});

test("select-all row sits in each fulfillment section and shows a mixed state when partially selected", () => {
  const cartScreen = readMobileFile("app/(tabs)/cart.tsx");
  const fulfillment = readMobileFile("entities/cart/ui/CartFulfillmentSection.tsx");
  const selectAllRow = readMobileFile("entities/cart/ui/CartSelectAllRow.tsx");

  assert.match(cartScreen, /<CartFulfillmentSection/);
  assert.match(fulfillment, /<CartSelectAllRow/);
  assert.match(selectAllRow, /isIndeterminate = !areAllSelected && selectedCount > 0/);
  assert.match(
    selectAllRow,
    /accessibilityState=\{\{ checked: isIndeterminate \? "mixed" : areAllSelected \}\}/,
  );
});

test("toggleAll selects everything unless everything is already selected", () => {
  const selection = readMobileFile("entities/cart/model/useCartSelection.ts");

  // Снято всё -> выбрать всё; выбрано частично -> выбрать всё; выбрано всё -> снять всё.
  assert.match(
    selection,
    /setDeselectedIds\(\(prev\) => \(prev\.size === 0 \? new Set\(purchasableIdSet\) : EMPTY_DESELECTION\)\)/,
  );
  assert.match(selection, /toggleAllIn/);
});

test("cart totals follow the selection", () => {
  const cartScreen = readMobileFile("app/(tabs)/cart.tsx");
  const fulfillment = readMobileFile("entities/cart/ui/CartFulfillmentSection.tsx");

  assert.match(cartScreen, /canCheckoutActive = activeSummary\.selectedLines\.length > 0/);
  assert.match(fulfillment, /formatPriceRub\(summary\.selectedTotal\)/);
  assert.doesNotMatch(cartScreen, /displayTotal/);
});
