import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readFile = (root, relativePath) =>
  readFileSync(join(root, relativePath), "utf8");

test("seller products page includes web header blocks", () => {
  const page = readFile(
    MOBILE_ROOT,
    "features/seller-products-page/ui/SellerProductsPage.tsx",
  );
  const route = readFile(MOBILE_ROOT, "app/seller/[userId].tsx");
  const stats = readFile(MOBILE_ROOT, "entities/user/ui/SellerProfileQuickStats.tsx");
  const layout = readFile(
    MOBILE_ROOT,
    "features/seller-products-page/lib/sellerProductsPageLayout.ts",
  );
  const webCss = readFile(
    CLIENT_ROOT,
    "src/pages/seller-products/ui/SellerProductsPage.css",
  );
  const webPage = readFile(
    CLIENT_ROOT,
    "src/pages/seller-products/ui/SellerProductsPage.jsx",
  );

  assert.match(route, /SellerProductsPage/);
  assert.doesNotMatch(route, /ScreenWithBack/);
  assert.match(page, /styles\.navTitle/);
  assert.match(page, /SELLER_PRODUCTS_PAGE_UI\.TITLE/);
  assert.match(page, /SELLER_PRODUCTS_PAGE_UI\.BACK_ARIA/);
  assert.match(page, /ProfileOverviewBanner/);
  assert.match(page, /SellerProfileQuickStats/);
  assert.match(page, /styles\.sellerMetaZone/);
  assert.match(page, /styles\.shelfChip/);
  assert.match(stats, /gridCompact/);
  assert.match(stats, /itemCompactHalf/);
  assert.match(stats, /itemCompactFull/);
  assert.match(stats, /fetchUserPhone/);
  assert.match(layout, /screenGap: 8/);
  assert.doesNotMatch(
    readFile(MOBILE_ROOT, "shared/theme/sellerFlowStyles.ts"),
    /header:\s*\{[\s\S]*?marginBottom: L\.screenGap/,
  );
  assert.match(layout, /statsStackBreakpoint: 420/);
  assert.match(webPage, /seller-products-page__nav-title/);
  assert.match(webPage, /SellerProfileQuickStats/);
  assert.match(
    readFile(CLIENT_ROOT, "src/entities/user/ui/SellerProfileQuickStats.css"),
    /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/,
  );
  assert.match(webCss, /seller-products-page__shelf-chip/);
  assert.match(
    webCss,
    /\.seller-products-page \.app-shell__grid[\s\S]*margin-inline: 0/,
  );
  assert.match(webCss, /overflow-x: clip/);
  assert.match(page, /contentWidth=\{productGrid\.contentWidth\}/);
  assert.match(
    readFile(MOBILE_ROOT, "features/catalog-grid/ui/CatalogGridRowItem.tsx"),
    /resolveFlexGridItemWidthStyle/,
  );
});
