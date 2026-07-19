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
  const tabs = readMobileFile("features/product-promotion/ui/ProductPromotionModalTabs.tsx");
  const styles = readMobileFile("shared/theme/modalChromeStyles.ts");
  const chrome = readMobileFile("entities/product/lib/productPromotionTierChrome.ts");
  const manage = readMobileFile("entities/product/ui/ProductEditManageSection.tsx");
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(modal, /resolveProductPromotionTierCardStyle/);
  assert.match(modal, /resolveProductPromotionDurationChipStyle/);
  assert.match(modal, /getProductPromotionTierChrome/);
  assert.match(modal, /styles\.overviewCard/);
  assert.match(modal, /styles\.planCard/);
  assert.match(modal, /styles\.tierCheck/);
  assert.match(modal, /styles\.footer/);
  assert.match(modal, /ProductPromotionModalTabs/);
  assert.match(modal, /ProductPromotionManageTab/);
  assert.match(modal, /onToggleRaffleParticipation/);
  assert.match(modal, /InstallmentProgramModal/);
  assert.match(modal, /isInstallmentProgramOpen/);
  assert.match(modal, /embedded/);
  assert.match(tabs, /variant="segment"/);
  assert.match(tabs, /TAB_MANAGE/);
  assert.match(copy, /MODAL_TITLE: "Управление"/);
  assert.match(manage, /warningBanner/);
  assert.doesNotMatch(manage, /styles\.title/);

  const promotionStyles = styles.slice(
    styles.indexOf("export const useProductPromotionModalStyles"),
    styles.indexOf("export const useSellerProductsLimitModalStyles"),
  );

  assert.match(promotionStyles, /overviewCardOk/);
  assert.match(promotionStyles, /planCard/);
  assert.match(promotionStyles, /backgroundColor: theme\.colors\.action/);
  assert.doesNotMatch(promotionStyles, /tierCardSelected/);
  assert.doesNotMatch(promotionStyles, /nearBlack/);

  assert.match(chrome, /PRODUCT_PROMOTION_TIER_GOLD/);
  assert.match(chrome, /PRODUCT_PROMOTION_TIER_TOP/);
  assert.match(chrome, /PRODUCT_PROMOTION_TIER_BANNER/);
  assert.match(chrome, /borderWidth: 2/);
});
