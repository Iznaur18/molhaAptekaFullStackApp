import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("my products page uses catalog toolbar, grid and seller card footer", () => {
  const page = readMobileFile("features/my-products-page/ui/MyProductsPage.tsx");
  const tabBar = readMobileFile("shared/ui/MobileBottomTabBar.tsx");
  const toolbar = readMobileFile(
    "features/my-products-catalog-toolbar/ui/MyProductsCatalogToolbar.tsx",
  );
  const gridRow = readMobileFile(
    "features/my-products-page/ui/MyProductsCatalogGridRowItem.tsx",
  );
  const productCard = readMobileFile("entities/product/ui/ProductCard.tsx");
  const sellerToolbar = readMobileFile("entities/product/ui/ProductCardSellerToolbar.tsx");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /MyProductsCatalogToolbar/);
  assert.match(page, /ListHeaderComponent/);
  assert.doesNotMatch(page, /styles\.createButton/);
  assert.match(page, /buildCatalogGridRows/);
  assert.match(page, /MyProductsCatalogGridRowItem/);
  assert.match(page, /usePlaceProductPress/);
  assert.match(tabBar, /SellerProductsLimitModal/);
  assert.match(tabBar, /usePlaceProductPress/);
  assert.match(page, /sellerRaffleActive/);
  assert.match(page, /openInstallmentProgramModal/);
  assert.match(page, /useMyProductsPageActions/);
  assert.match(page, /moderationStatus: moderationFilter/);
  assert.doesNotMatch(page, /cardWrap/);
  assert.doesNotMatch(page, /cardActions/);

  assert.match(toolbar, /CATALOG_SORT_OPTIONS_MY_PRODUCTS/);
  assert.match(toolbar, /MY_PRODUCTS_MODERATION_FILTER_OPTIONS/);
  assert.match(toolbar, /formatSellerProductsQuota/);

  assert.match(gridRow, /MyProductCatalogCard/);
  assert.match(gridRow, /onEditProduct/);
  assert.match(gridRow, /onPromoteProduct/);
  assert.doesNotMatch(gridRow, /layout="catalog-grid"/);

  assert.match(page, /myProductsGridResolvers/);
  assert.match(page, /resolveColumns: \(\) => 1/);

  const myProductCard = readMobileFile("entities/product/ui/MyProductCatalogCard.tsx");
  assert.match(myProductCard, /ProductCardSellerToolbar/);
  assert.match(myProductCard, /variant="compact"/);
  assert.match(myProductCard, /getProductModerationBadgeLabel/);
  assert.match(myProductCard, /getProductCardMineStatusBadge/);
  assert.match(myProductCard, /ProductCompactCardMediaThumb/);

  assert.match(productCard, /ProductCardSellerToolbar/);
  assert.match(productCard, /getProductModerationBadgeLabel/);
  assert.match(productCard, /ProductCardModerationPendingOverlay/);
  assert.match(productCard, /isLoyaltyPointsOvercommitted/);
  assert.match(productCard, /showWishlistToggle/);

  assert.match(sellerToolbar, /PROMOTION_BUTTON/);
  assert.match(sellerToolbar, /EDIT_PRODUCT/);
  assert.match(sellerToolbar, /variant\?: "default" \| "compact"/);
});

test("my products infinite query passes sort and moderation filters", () => {
  const query = readMobileFile("entities/product/model/useMyProductsInfiniteQuery.ts");

  assert.match(query, /moderationStatus/);
  assert.match(query, /sort:/);
});
