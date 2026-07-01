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
  assert.match(page, /buildCatalogGridRows/);
  assert.match(page, /tileWidth/);
  assert.match(page, /removeFromQueue/);
  assert.match(page, /PRODUCTS_LIST_ARIA/);
  assert.match(page, /activeSectionId="product-moderation"/);
  assert.match(page, /TAB_PRODUCT_MODERATION/);
  assert.doesNotMatch(page, /StaffModerationActions/);
  assert.doesNotMatch(page, /staffQueueStyles/);

  assert.match(styles, /stateError/);
});

test("product moderation details footer mirrors web", () => {
  const footer = readMobileFile("entities/product/ui/ProductModerationDetailsFooter.tsx");

  assert.match(footer, /REJECT_COMMENT_LABEL/);
  assert.match(footer, /APPROVE/);
  assert.match(footer, /REJECT/);
});

test("product moderation grid row uses catalog-grid product card", () => {
  const rowItem = readMobileFile(
    "features/product-moderation-page/ui/ProductModerationGridRowItem.tsx",
  );

  assert.match(rowItem, /layout="catalog-grid"/);
  assert.match(rowItem, /isModerationQueue/);
  assert.match(rowItem, /tileWidth/);
});

test("product card moderation queue mirrors web preview fields", () => {
  const card = readMobileFile("entities/product/ui/ProductCard.tsx");
  const preview = readMobileFile("entities/product/ui/ProductCardModerationPreviewFields.tsx");

  assert.match(card, /ProductCardModerationPreviewFields/);
  assert.match(card, /ProductCardMediaGalleryNav/);
  assert.match(card, /isModerationQueue \?/);
  assert.match(preview, /PRODUCT_CARD_MODERATION_PREVIEW_FIELD_KEYS_WITHOUT_PRICE/);
  assert.match(
    readMobileFile("entities/product/lib/productFieldRegistry.ts"),
    /"createdAt"/,
  );
});

test("product moderation ui copy matches web page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /PRODUCTS_LIST_ARIA: "Очередь товаров на модерации"/);
  assert.match(copy, /REJECT_COMMENT_LABEL: "Комментарий для продавца/);
});
