import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("premium page mirrors web plan panel and purchase flow", () => {
  const page = readMobileFile("features/premium-page/ui/PremiumPage.tsx");
  const styles = readMobileFile("shared/theme/premiumPageStyles.ts");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /PLAN_BENEFITS/);
  assert.match(page, /INSUFFICIENT_POINTS/);
  assert.match(page, /SUBMIT_PENDING/);
  assert.match(page, /!pricePoints/);
  assert.match(page, /activeSectionId="premium"/);
  assert.doesNotMatch(page, /accountFeatureStyles/);

  assert.match(styles, /heroValue/);
  assert.match(styles, /heroCaption/);
  assert.match(styles, /submitButton/);
  assert.match(styles, /active/);
});

test("premium ui copy matches web premium page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /PAGE_ARIA: "Премиум"/);
  assert.match(copy, /Просмотр покупок других пользователей/);
  assert.match(copy, /SUBMIT: "Оформить премиум"/);
});
