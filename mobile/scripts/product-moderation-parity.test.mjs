import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("product moderation page mirrors web queue grid and actions", () => {
  const page = readMobileFile("features/product-moderation-page/ui/ProductModerationPage.tsx");
  const styles = readMobileFile("shared/theme/productModerationPageStyles.ts");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /ProductModerationGridRowItem/);
  assert.match(page, /ProfileAccountList/);
  assert.match(page, /useProfileAccountNestedListScroll/);
  assert.doesNotMatch(page, /CatalogAnimatedFlatList/);
  assert.doesNotMatch(page, /resolveListStyle/);
  assert.doesNotMatch(page, /CatalogScrollAnimationProvider/);
  assert.match(page, /buildCatalogGridRows/);
  assert.match(page, /moderationQueueGridResolvers/);
  assert.match(page, /resolveColumns: \(\) => 1/);
  assert.match(page, /resolveProfileHubMainReservedWidth/);
  assert.match(page, /listInAccountShell/);
  assert.match(page, /contentWidth=\{productGrid\.contentWidth\}/);
  assert.match(page, /removeFromQueue/);
  assert.match(page, /PRODUCTS_LIST_ARIA/);
  assert.match(page, /activeSectionId="product-moderation"/);
  assert.match(page, /TAB_PRODUCT_MODERATION/);
  assert.doesNotMatch(page, /StaffModerationActions/);
  assert.doesNotMatch(page, /staffQueueStyles/);

  assert.match(styles, /stateError/);
  assert.match(styles, /listInAccountShell/);
});

test("product moderation details footer mirrors web", () => {
  const footer = readMobileFile("entities/product/ui/ProductModerationDetailsFooter.tsx");

  assert.match(footer, /REJECT_COMMENT_LABEL/);
  assert.match(footer, /APPROVE/);
  assert.match(footer, /REJECT/);
});

test("product moderation grid row uses compact queue card", () => {
  const rowItem = readMobileFile(
    "features/product-moderation-page/ui/ProductModerationGridRowItem.tsx",
  );
  const card = readMobileFile("entities/product/ui/ProductModerationQueueCard.tsx");

  assert.match(rowItem, /ProductModerationQueueCard/);
  assert.match(rowItem, /tileWidth/);
  assert.match(rowItem, /width: "100%"/);
  assert.match(rowItem, /resolveFlexGridItemWidthStyle/);
  assert.match(card, /ProductModerationDetailsFooter/);
  assert.match(card, /variant="compact"/);
  assert.match(card, /ProductCompactCardMediaThumb/);
  assert.match(card, /useProductCompactCardStyles/);
});

test("product moderation queue card keeps moderation preview data", () => {
  const card = readMobileFile("entities/product/ui/ProductModerationQueueCard.tsx");

  assert.match(card, /formatProductFieldForDisplay\("productDescription"/);
  assert.match(card, /formatProductFieldForDisplay\("createdAt"/);
  assert.match(card, /ProductCardSellerRow/);
  assert.match(card, /ProductPriceDisplay/);
  assert.doesNotMatch(card, /ProductCardModerationPreviewFields/);
});

test("product moderation ui copy matches web page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /PRODUCTS_LIST_ARIA: "Очередь товаров на модерации"/);
  assert.match(copy, /REJECT_COMMENT_LABEL: "Комментарий для продавца/);
});
