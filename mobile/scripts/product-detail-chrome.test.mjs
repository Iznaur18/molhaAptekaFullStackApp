import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readFile = (root, relativePath) =>
  readFileSync(join(root, relativePath), "utf8");

test("web mobile bottom nav hidden while product details modal is open", () => {
  const navCss = readFile(
    CLIENT_ROOT,
    "src/widgets/mobile-bottom-nav/ui/MobileBottomNav.css",
  );

  assert.match(navCss, /body:has\(\.product-details-modal\)\s+\.mobile-bottom-nav/);
  assert.match(navCss, /display:\s*none/);
});

test("web product details modal uses full viewport and dock without nav offset", () => {
  const mobileCss = readFile(
    CLIENT_ROOT,
    "src/entities/product/ui/product-details-modal/ProductDetailsModalMobile.css",
  );
  const tokensCss = readFile(
    CLIENT_ROOT,
    "src/entities/product/ui/product-details-modal/productDetailsModalTokens.css",
  );

  assert.match(mobileCss, /\.product-modal-shell__backdrop:has\(\.product-details-modal\)[\s\S]*inset:\s*0/);
  assert.doesNotMatch(
    mobileCss,
    /product-details-modal[\s\S]*--app-shell-mobile-bottom-nav-height/,
  );
  assert.match(
    mobileCss,
    /\.product-modal-shell__docked-footer[\s\S]*bottom:\s*env\(safe-area-inset-bottom/,
  );
  assert.doesNotMatch(tokensCss, /--app-shell-mobile-bottom-nav-height/);
  assert.match(tokensCss, /--product-details-modal-mobile-dock-max-height/);
});

test("mobile product detail stat rows match web modal stats grid layout", () => {
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const fieldRows = readFile(MOBILE_ROOT, "entities/product/ui/ProductDetailFieldRows.tsx");
  const registry = readFile(MOBILE_ROOT, "entities/product/lib/productFieldRegistry.ts");

  const rowStatBlock = styles.match(/rowStat:\s*\{([^}]*)\}/)?.[1] ?? "";
  const keyStatBlock = styles.match(/keyStat:\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(rowStatBlock, /flexDirection:\s*"row"/);
  assert.match(rowStatBlock, /justifyContent:\s*"space-between"/);
  assert.doesNotMatch(rowStatBlock, /borderWidth/);
  assert.match(keyStatBlock, /fontSize:\s*14/);
  assert.doesNotMatch(keyStatBlock, /textTransform:\s*"uppercase"/);
  assert.match(styles, /valueStat:[\s\S]*textAlign:\s*"right"/);
  assert.match(fieldRows, /numberOfLines=\{isStatRow \? 1 : undefined\}/);
  assert.match(registry, /productSaleCity:\s*"Город продажи"/);
});

test("mobile product description panel matches web content-switcher chrome", () => {
  const detailsTab = readFile(MOBILE_ROOT, "features/product-detail/ui/ProductDetailsDetailsTab.tsx");
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const webCss = readFile(
    CLIENT_ROOT,
    "src/entities/product/ui/product-details-modal/ProductDetailsContentSwitcher.css",
  );
  const panelBlock = styles.match(/contentSwitcherPanel:\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(webCss, /product-details-content-switcher__panel/);
  assert.match(webCss, /border:\s*1px solid/);
  assert.match(detailsTab, /contentSwitcherPanel/);
  assert.match(detailsTab, /descriptionText/);
  assert.match(panelBlock, /borderWidth:\s*1/);
  assert.match(panelBlock, /borderColor:\s*theme\.colors\.border/);
  assert.match(panelBlock, /backgroundColor:\s*theme\.colors\.surface/);
});

test("mobile product characteristics row matches web key-value layout", () => {
  const component = readFile(MOBILE_ROOT, "entities/product/ui/ProductCharacteristicsDetails.tsx");
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const webCss = readFile(CLIENT_ROOT, "src/entities/product/ui/ProductCharacteristicsDetails.css");
  const charStylesBlock =
    styles.match(/export const useProductCharacteristicsDetailsStyles[\s\S]*?}\)\);/)?.[0] ?? "";
  const rowBlock = charStylesBlock.match(/row:\s*\{([^}]*)\}/)?.[1] ?? "";
  const valueBlock = charStylesBlock.match(/value:\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(webCss, /flex-direction:\s*row/);
  assert.match(webCss, /justify-content:\s*space-between/);
  assert.match(component, /styles\.key/);
  assert.match(component, /styles\.value/);
  assert.match(rowBlock, /flexDirection:\s*"row"/);
  assert.match(rowBlock, /justifyContent:\s*"space-between"/);
  assert.match(valueBlock, /textAlign:\s*"right"/);
  assert.match(valueBlock, /maxWidth:\s*"55%"/);
});

test("mobile seller preview matches web product-details-seller-preview chrome", () => {
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const preview = readFile(MOBILE_ROOT, "entities/product/ui/ProductDetailsSellerPreview.tsx");
  const sellerStylesBlock =
    styles.match(/export const useProductDetailsSellerPreviewStyles[\s\S]*?}\)\);/)?.[0] ?? "";

  assert.match(sellerStylesBlock, /backgroundColor:\s*theme\.colors\.actionSurface/);
  assert.match(sellerStylesBlock, /borderColor:\s*`\$\{theme\.colors\.link\}29`/);
  assert.match(sellerStylesBlock, /rootPressed:/);
  assert.match(preview, /pressed && styles\.rootPressed/);
  assert.match(sellerStylesBlock, /minWidth:\s*152/);
});

test("mobile premium display name aligns from start like web user-premium-name", () => {
  const styles = readFile(MOBILE_ROOT, "shared/theme/userPremiumStyles.ts");
  const rootBlock = styles.match(/root:\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(rootBlock, /justifyContent:\s*"flex-start"/);
  assert.doesNotMatch(rootBlock, /justifyContent:\s*"center"/);
});

test("mobile product review item header matches web author name and badge", () => {
  const item = readFile(MOBILE_ROOT, "entities/product-review/ui/ProductReviewListItem.tsx");
  const webItem = readFile(CLIENT_ROOT, "src/entities/product-review/ui/ProductReviewListItem.jsx");
  const tabStyles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const itemHeaderBlock = tabStyles.match(/itemHeader:\s*\{([^}]*)\}/)?.[1] ?? "";
  const itemAuthorBlock = tabStyles.match(/itemAuthor:\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(item, /review\.author\?\.userName/);
  assert.match(item, /UserDataConfirmedBadge/);
  assert.match(item, /UserPremiumVerifiedBadge/);
  assert.match(item, /itemAuthorBadge/);
  assert.doesNotMatch(item, /authorUserName/);
  assert.match(webItem, /review\.author\?\.userName/);
  assert.match(itemHeaderBlock, /justifyContent:\s*"space-between"/);
  assert.match(itemAuthorBlock, /flexDirection:\s*"row"/);

  const reviewsTab = readFile(MOBILE_ROOT, "features/product-detail/ui/ProductReviewsTab.tsx");
  assert.match(reviewsTab, /ProductReviewListItem/);
  assert.doesNotMatch(reviewsTab, /ReviewCard/);
});

test("mobile product review summary matches web gradient chrome", () => {
  const summary = readFile(MOBILE_ROOT, "entities/product-review/ui/ProductReviewSummary.tsx");
  const background = readFile(
    MOBILE_ROOT,
    "entities/product-review/ui/ProductReviewSummaryBackground.tsx",
  );
  const palette = readFile(MOBILE_ROOT, "entities/product-review/lib/productReviewSummaryPalette.ts");
  const webCss = readFile(CLIENT_ROOT, "src/entities/product-review/ui/ProductReviewSummary.css");
  const tabStyles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const summaryCardBlock = tabStyles.match(/summaryCard:\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(webCss, /linear-gradient/);
  assert.match(webCss, /warning-amber/);
  assert.match(summary, /buildProductReviewSummaryCardStyle/);
  assert.match(background, /buildProductReviewSummaryCardStyle/);
  assert.match(background, /linear-gradient\(145deg/);
  assert.match(palette, /#f8fafc/);
  assert.match(palette, /#f0eee1/);
  assert.match(summaryCardBlock, /overflow:\s*"hidden"/);
  assert.doesNotMatch(summaryCardBlock, /backgroundColor/);

  const reviewsTab = readFile(MOBILE_ROOT, "features/product-detail/ui/ProductReviewsTab.tsx");
  assert.match(reviewsTab, /ProductReviewSummary/);
  assert.doesNotMatch(reviewsTab, /styles\.summaryCard/);
});

test("mobile product detail screen is outside tabs and uses dock-only scroll padding", () => {
  const rootLayout = readFile(MOBILE_ROOT, "app/_layout.tsx");
  const layoutLib = readFile(MOBILE_ROOT, "shared/lib/productDetailScreenLayout.ts");
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const tabLayout = readFile(MOBILE_ROOT, "app/(tabs)/_layout.tsx");

  assert.match(rootLayout, /name="product\/\[id\]"/);
  assert.doesNotMatch(tabLayout, /product\/\[id\]/);
  assert.match(layoutLib, /PRODUCT_DETAIL_DOCK_SCROLL_PADDING = 88/);
  assert.match(styles, /PRODUCT_DETAIL_DOCK_SCROLL_PADDING/);
  assert.doesNotMatch(styles, /DETAIL_DOCK_SCROLL_PADDING = 124/);
});

test("mobile installment tab matches web buyer hint and docked submit", () => {
  const tab = readFile(MOBILE_ROOT, "features/product-detail/ui/ProductInstallmentTab.tsx");
  const screen = readFile(MOBILE_ROOT, "app/product/[id].tsx");
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const webCss = readFile(CLIENT_ROOT, "src/entities/installment/ui/InstallmentBuyerBlock.css");

  assert.match(webCss, /installment-buyer-block__hint/);
  assert.match(webCss, /--iz-color-action-soft/);
  assert.match(webCss, /--iz-color-info-navy/);
  assert.match(styles, /installmentBuyerHint/);
  assert.match(styles, /actionSoft/);
  assert.match(styles, /infoNavy/);
  assert.match(tab, /installmentBuyerHint/);
  assert.match(tab, /INSTALLMENT_UI\.BUYER_HINT/);
  assert.match(tab, /onDockFooterChange/);
  assert.match(screen, /installmentDock/);
  assert.match(screen, /showInstallmentDock/);
  assert.match(styles, /installmentDock:/);
});

test("mobile auction tab matches web price-offer layout and docked submit", () => {
  const tab = readFile(MOBILE_ROOT, "features/product-detail/ui/ProductAuctionTab.tsx");
  const topList = readFile(MOBILE_ROOT, "features/product-detail/ui/ProductPriceOfferTopList.tsx");
  const screen = readFile(MOBILE_ROOT, "app/product/[id].tsx");
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const webCss = readFile(CLIENT_ROOT, "src/entities/product-price-offer/ui/ProductPriceOffer.css");

  assert.match(webCss, /product-price-offer__top-item/);
  assert.match(webCss, /product-price-offer__status--pending/);
  assert.match(styles, /useProductPriceOfferStyles/);
  assert.match(styles, /topItem:/);
  assert.match(styles, /statusPending:/);
  assert.match(tab, /SECTION_TOP_TITLE/);
  assert.match(tab, /useProductPriceOfferStyles/);
  assert.match(tab, /onDockFooterChange/);
  assert.match(topList, /UserPremiumDisplayName/);
  assert.match(topList, /topRank/);
  assert.match(screen, /auctionDock/);
  assert.match(screen, /showAuctionDock/);
  assert.doesNotMatch(tab, /Текущая цена/);
});
