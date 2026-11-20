import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readFile = (root, relativePath) => readFileSync(join(root, relativePath), "utf8");

test("product detail split breakpoint matches web constants", () => {
  const mobileLayout = readFile(MOBILE_ROOT, "shared/lib/productDetailScreenLayout.ts");
  const webConstants = readFile(
    CLIENT_ROOT,
    "src/entities/product/lib/productDetailsPageLayoutConstants.js",
  );

  assert.match(mobileLayout, /PRODUCT_DETAILS_PAGE_SPLIT_MIN_PX = 767/);
  assert.match(webConstants, /767/);
});

test("product detail page wires split layout at >=767", () => {
  const screen = readFile(MOBILE_ROOT, "app/product/[id].tsx");
  const hook = readFile(MOBILE_ROOT, "shared/model/useProductDetailPageLayout.ts");

  assert.match(screen, /useProductDetailPageLayout/);
  assert.match(screen, /pageLayout\.isPageSplit/);
  assert.match(screen, /presentation="split-rail"/);
  assert.match(screen, /presentation="split-rest"/);
  assert.match(screen, /!pageLayout\.isPageSplit/);
  assert.match(hook, /resolveProductDetailPageSplit/);
});

test("product detail inline purchase actions render on split", () => {
  const purchaseActions = readFile(
    MOBILE_ROOT,
    "features/product-detail/ui/ProductDetailPurchaseActions.tsx",
  );
  const detailsTab = readFile(
    MOBILE_ROOT,
    "features/product-detail/ui/ProductDetailsDetailsTab.tsx",
  );

  assert.match(purchaseActions, /variant = "inline"/);
  assert.match(purchaseActions, /styles\.inlineRoot/);
  assert.doesNotMatch(
    purchaseActions,
    /if\s*\(\s*variant\s*===\s*"inline"[\s\S]*return null/,
  );
  assert.match(detailsTab, /showInlinePurchaseActions/);
  assert.match(detailsTab, /variant="inline"/);
});

test("product detail gallery accepts responsive hero size", () => {
  const gallery = readFile(MOBILE_ROOT, "entities/product/ui/ProductMediaGallery.tsx");
  const mediaSection = readFile(
    MOBILE_ROOT,
    "features/product-detail/ui/ProductDetailMediaSection.tsx",
  );

  assert.match(gallery, /heroSize\?: ProductDetailHeroSize/);
  assert.match(gallery, /resolveProductDetailHeroSize/);
  assert.match(mediaSection, /heroSize={heroSize}/);
});

test("product detail tab bar layout matches web modal section tabs", () => {
  const layout = readFile(MOBILE_ROOT, "shared/lib/productDetailTabBarLayout.ts");
  const webTabsCss = readFile(
    CLIENT_ROOT,
    "src/entities/product/ui/product-details-modal/ProductDetailsModalTabs.css",
  );

  assert.match(layout, /tabPaddingVertical: 11\.2/);
  assert.match(layout, /tabPaddingHorizontal: 12/);
  assert.match(webTabsCss, /padding: 0\.7rem 0\.75rem/);
  assert.match(webTabsCss, /font-weight: 700/);
});

test("product detail hero chrome matches web gallery readonly sizes", () => {
  const layout = readFile(MOBILE_ROOT, "shared/lib/productDetailHeroChromeLayout.ts");
  const thumbLayout = readFile(
    MOBILE_ROOT,
    "entities/product/lib/productMediaGalleryReadonlyLayout.ts",
  );
  const gallery = readFile(MOBILE_ROOT, "entities/product/ui/ProductMediaGallery.tsx");
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const webCss = readFile(
    CLIENT_ROOT,
    "src/entities/product/ui/ProductMediaGalleryReadonly.css",
  );
  const mediaSection = readFile(
    MOBILE_ROOT,
    "features/product-detail/ui/ProductDetailMediaSection.tsx",
  );

  const webPageCss = readFile(
    CLIENT_ROOT,
    "src/pages/product-details/ui/ProductDetailsPage.css",
  );

  const webMobileCss = readFile(
    CLIENT_ROOT,
    "src/entities/product/ui/product-details-modal/ProductDetailsModalMobile.css",
  );

  // ≤640 page/modal: back 2.5rem / inset 0.65rem / actions gap 0.5rem
  assert.match(layout, /backSize: 40/);
  assert.match(layout, /actionSize: 32/);
  assert.match(layout, /iconSize: 20/);
  assert.match(layout, /inset: 10\.4/);
  assert.match(layout, /actionsGap: 8/);
  assert.match(thumbLayout, /thumbSize: 64/);
  assert.match(thumbLayout, /thumbGap: 6\.4/);
  assert.match(thumbLayout, /thumbBorderWidth: 2/);
  assert.match(webCss, /width: var\(--product-image-thumb-side\)/);
  assert.match(webCss, /gap: 0\.4rem/);
  assert.match(webCss, /border-color: var\(--iz-color-link\)/);
  assert.match(gallery, /HorizontalOverflowRow/);
  assert.match(gallery, /height=\{GRL\.thumbSize\}/);
  assert.match(gallery, /GALLERY_THUMBS_ARIA/);
  assert.match(styles, /detailThumbs:[\s\S]*flexWrap: "nowrap"/);
  assert.match(styles, /detailThumb:[\s\S]*GRL\.thumbSize/);
  assert.match(styles, /detailThumbActive:[\s\S]*theme\.colors\.link/);
  assert.match(styles, /detailThumbsSplit:[\s\S]*GRL\.thumbsPaddingInlineSplit/);
  assert.match(webMobileCss, /width: 2\.5rem/);
  assert.match(webMobileCss, /height: 2\.5rem/);
  assert.match(webMobileCss, /top: 0\.65rem/);
  assert.match(webMobileCss, /gap: 0\.5rem/);
  assert.match(webPageCss, /width: 32px/);
  assert.match(styles, /PRODUCT_DETAIL_HERO_CHROME\.backSize/);
  assert.match(styles, /PRODUCT_DETAIL_HERO_CHROME\.actionSize/);
  assert.match(mediaSection, /theme\.colors\.text/);
  assert.doesNotMatch(mediaSection, /semanticColors\.danger/);
});

test("product detail mobile dock matches web ≤640 docked footer", () => {
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const cartStyles = readFile(MOBILE_ROOT, "shared/theme/uploadFieldStyles.ts");
  const purchaseActions = readFile(
    MOBILE_ROOT,
    "features/product-detail/ui/ProductDetailPurchaseActions.tsx",
  );
  const screen = readFile(MOBILE_ROOT, "app/product/[id].tsx");
  const webPageCss = readFile(
    CLIENT_ROOT,
    "src/pages/product-details/ui/ProductDetailsPage.css",
  );
  const webPriceCss = readFile(
    CLIENT_ROOT,
    "src/entities/product/ui/product-details-modal/ProductDetailsModalPrice.css",
  );

  assert.match(styles, /PRODUCT_DETAIL_PURCHASE_DOCK_INSET = 0/);
  assert.match(styles, /PRODUCT_DETAIL_PURCHASE_DOCK_BOTTOM_INSET = 0/);
  assert.match(styles, /PRODUCT_DETAIL_PURCHASE_DOCK_TOP_RADIUS = 0/);
  assert.match(styles, /purchaseDockInner:[\s\S]*paddingTop: 8\.8/);
  assert.match(styles, /purchaseDockInner:[\s\S]*paddingHorizontal: 12/);
  assert.match(styles, /purchaseDockInner:[\s\S]*paddingBottom: 10\.4/);
  assert.match(styles, /purchaseDockInner:[\s\S]*borderTopWidth/);
  assert.match(styles, /dockBackButton:[\s\S]*minWidth: 88/);
  assert.match(styles, /dockBackButton:[\s\S]*minHeight: 48/);
  assert.match(styles, /dockBackButton:[\s\S]*borderRadius: 20/);
  assert.match(cartStyles, /PRODUCT_DETAIL_DOCK_CTA_BORDER_RADIUS = 20/);
  assert.match(purchaseActions, /onBack\?:/);
  assert.match(purchaseActions, /PRODUCT_DETAILS_MODAL_UI\.BACK_ARIA/);
  assert.match(screen, /onBack=\{/);
  assert.match(webPageCss, /padding: 0\.55rem var\(--iz-space-3\)/);
  assert.match(webPageCss, /border-radius: 1\.25rem/);
  assert.match(webPriceCss, /price-actions--with-back/);
  assert.match(webPriceCss, /min-width: 5\.5rem/);
});

test("product detail split styles mirror web page-wide layout", () => {
  const screen = readFile(MOBILE_ROOT, "app/product/[id].tsx");
  const similarTab = readFile(
    MOBILE_ROOT,
    "features/product-detail/ui/ProductSimilarTab.tsx",
  );
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const detailsTab = readFile(
    MOBILE_ROOT,
    "features/product-detail/ui/ProductDetailsDetailsTab.tsx",
  );
  const webCss = readFile(
    CLIENT_ROOT,
    "src/pages/product-details/ui/ProductDetailsPage.css",
  );

  assert.match(styles, /pageWideLayout:/);
  assert.match(styles, /pageWideTop:/);
  assert.match(styles, /featureCardsSplit:/);
  assert.match(styles, /display: "grid"/);
  assert.match(
    styles,
    /gridTemplateColumns: `repeat\(auto-fit, minmax\(\$\{FC\.gridSplitMinCellWidth\}px, 1fr\)\)`/,
  );
  assert.doesNotMatch(styles, /featureCardSplitCell:/);
  assert.match(
    detailsTab,
    /presentation === "split-rest" && styles\.featureCardsSplit/,
  );
  assert.match(detailsTab, /ProductDetailsQaTeaser/);
  assert.match(webCss, /product-details-page__wide-top/);
  assert.match(
    webCss,
    /grid-template-columns: minmax\(0, var\(--product-image-modal-main-side\)\)/,
  );
  assert.match(
    webCss,
    /grid-template-columns: repeat\(auto-fit, minmax\(12rem, 1fr\)\)/,
  );
  assert.match(
    webCss,
    /product-details-modal--page-split \.product-details-modal__tab-panel--inset[\s\S]*padding-inline: 0/,
  );
  assert.match(styles, /tabPanelSplit:/);
  assert.match(screen, /pageWideAltPanel/);
  assert.match(screen, /tabPanelSplit/);
  assert.match(screen, /variant="detailTab"/);
  assert.match(similarTab, /variant === "detailTab"/);
  assert.match(similarTab, /rowInsetX = isDetailTab \? 0/);
  assert.doesNotMatch(screen, /isAltTab && !isSimilarTab/);
});
