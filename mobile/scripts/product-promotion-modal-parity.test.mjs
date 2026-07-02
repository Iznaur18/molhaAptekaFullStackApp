import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("product promotion modal mirrors web tier and action colors", () => {
  const modal = readMobileFile("features/product-promotion/ui/ProductPromotionModal.tsx");
  const styles = readMobileFile("shared/theme/modalChromeStyles.ts");
  const chrome = readMobileFile("entities/product/lib/productPromotionTierChrome.ts");

  assert.match(modal, /resolveProductPromotionTierCardStyle/);
  assert.match(modal, /resolveProductPromotionDurationChipStyle/);
  assert.match(modal, /styles\.productBox/);
  assert.match(modal, /styles\.footer/);
  assert.match(modal, /ProductPromotionModalTabs/);
  assert.match(modal, /ProductPromotionManageTab/);
  assert.match(modal, /onToggleRaffleParticipation/);
  assert.match(modal, /InstallmentProgramModal/);
  assert.match(modal, /onOpenInstallmentProgram/);
  const promotionStyles = styles.slice(
    styles.indexOf("export const useProductPromotionModalStyles"),
    styles.indexOf("export const useSellerProductsLimitModalStyles"),
  );

  assert.match(promotionStyles, /balanceCardOk/);
  assert.match(promotionStyles, /#ecfdf5/);
  assert.match(promotionStyles, /backgroundColor: theme\.colors\.action/);
  assert.doesNotMatch(promotionStyles, /tierCardSelected/);
  assert.doesNotMatch(promotionStyles, /nearBlack/);

  assert.match(chrome, /PRODUCT_PROMOTION_TIER_GOLD/);
  assert.match(chrome, /PRODUCT_PROMOTION_TIER_TOP/);
  assert.match(chrome, /PRODUCT_PROMOTION_TIER_BANNER/);
});
