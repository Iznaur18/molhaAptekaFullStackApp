import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = join(MOBILE_ROOT, "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");
const readRepoFile = (relativePath) =>
  readFileSync(join(REPO_ROOT, relativePath), "utf8");

test("modal sheet scrim matches web wholesale-price gradient", () => {
  const backdrop = readMobileFile("shared/ui/ModalSheetGradientBackdrop.tsx");
  const gradient = readMobileFile("shared/lib/modalSheetBackdropGradient.ts");
  const webCss = readRepoFile("client/src/entities/product/ui/WholesalePriceModal.css");

  assert.match(webCss, /wholesale-price-modal__scrim/);
  assert.match(gradient, /opacity: 0\.28/);
  assert.match(gradient, /opacity: 0\.82/);
  assert.match(backdrop, /Platform\.OS === "web"/);
  assert.match(backdrop, /backgroundImage: buildModalSheetBackdropGradientCss/);
  assert.match(backdrop, /theme\.colors\.ink/);
});

test("sheet modals use gradient scrim instead of flat MODAL_BACKDROP_SCRIM", () => {
  for (const relativePath of [
    "features/product-detail/ui/ProductPromoCodeActivateSheet.tsx",
    "features/checkout/ui/CheckoutSheetModal.tsx",
    "shared/ui/AdminEditModalShell.tsx",
    "entities/region/ui/RuRegionPickerSheet.tsx",
  ]) {
    const source = readMobileFile(relativePath);
    assert.match(
      source,
      /ModalSheetGradientBackdrop/,
      `${relativePath}: expected gradient scrim`,
    );
  }

  const styles = readMobileFile("shared/theme/modalChromeStyles.ts");
  assert.doesNotMatch(
    styles,
    /backdrop:[\s\S]{0,120}backgroundColor: MODAL_BACKDROP_SCRIM/,
    "sheet backdrop styles should not use flat scrim",
  );
});
