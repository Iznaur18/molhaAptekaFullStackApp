import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("loyalty points page mirrors web balance and purchase panel", () => {
  const page = readMobileFile("features/loyalty-points-page/ui/LoyaltyPointsPage.tsx");
  const styles = readMobileFile("shared/theme/loyaltyPointsPageStyles.ts");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /ProfileAccountScrollBody/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /formatRubPriceInput/);
  assert.match(page, /parseRubPriceInput/);
  assert.match(page, /canSubmitPurchase/);
  assert.match(page, /COMING_SOON_AMOUNT/);
  assert.match(page, /activeSectionId="loyalty-points"/);
  assert.match(page, /TAB_LOYALTY_POINTS/);
  assert.doesNotMatch(page, /accountFeatureStyles/);

  assert.match(styles, /purchase:/);
  assert.match(styles, /theme\.colors\.primary/);
  assert.match(styles, /theme\.colors\.actionSoft/);
  assert.match(styles, /buyButton:/);
});

test("loyalty points ui copy matches web page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /PAGE_ARIA: "Баллы"/);
  assert.match(copy, /pluralizeRuBall/);
  assert.match(copy, /COMING_SOON: "Пополнение картой и по QR — скоро."/);
  assert.match(copy, /Продвижение товаров в каталоге/);
});
