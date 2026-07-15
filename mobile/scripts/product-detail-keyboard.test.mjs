import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(ROOT, relativePath), "utf8");

test("product detail keyboard: scroll into view + viewport inset + avoid docks", () => {
  const screen = read("app/product/[id].tsx");
  const scrollHelper = read("shared/lib/scrollTextInputIntoViewOnFocus.ts");
  const viewportHook = read("shared/lib/useVisualViewportKeyboardBottomInset.ts");
  const reviews = read("features/product-detail/ui/ProductReviewsTab.tsx");
  const auction = read("features/product-detail/ui/ProductAuctionTab.tsx");
  const installment = read("features/product-detail/ui/ProductInstallmentTab.tsx");
  const address = read("entities/address/ui/AddressSuggestInput.tsx");

  assert.match(viewportHook, /visualViewport/);
  assert.match(scrollHelper, /ensureTextInputVisibleAboveKeyboard/);
  assert.match(scrollHelper, /KEYBOARD_FIELD_COMFORT_GAP_PX/);
  assert.match(scrollHelper, /scrollBy/);
  assert.doesNotMatch(scrollHelper, /block:\s*"center"/);
  assert.match(screen, /useVisualViewportKeyboardBottomInset/);
  assert.match(screen, /KeyboardAvoidingView/);
  assert.match(screen, /automaticallyAdjustKeyboardInsets/);
  assert.match(screen, /keyboardBottomInset === 0/);
  assert.match(reviews, /textInputFocusScrollProps/);
  assert.match(auction, /textInputFocusScrollProps/);
  assert.match(installment, /textInputFocusScrollProps/);
  assert.match(address, /textInputFocusScrollProps/);
});
