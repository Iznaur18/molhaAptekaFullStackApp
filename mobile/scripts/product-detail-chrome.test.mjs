import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readFile = (root, relativePath) =>
  readFileSync(join(root, relativePath), "utf8");

test("product detail section tabs sit below media inside scroll", () => {
  const screen = readFile(MOBILE_ROOT, "app/product/[id].tsx");
  const detailsTab = readFile(
    MOBILE_ROOT,
    "features/product-detail/ui/ProductDetailsDetailsTab.tsx",
  );
  const mediaSection = readFile(
    MOBILE_ROOT,
    "features/product-detail/ui/ProductDetailMediaSection.tsx",
  );

  assert.match(mediaSection, /ProductMediaGallery/);
  assert.match(screen, /ProductDetailMediaSection/);
  assert.match(screen, /ProductDetailTabBar/);
  const mediaIndex = screen.indexOf("<ProductDetailMediaSection");
  const tabBarIndex = screen.indexOf("<ProductDetailTabBar");
  const scrollIndex = screen.indexOf("<ScrollView");
  assert.ok(scrollIndex >= 0);
  assert.ok(mediaIndex > scrollIndex);
  assert.ok(tabBarIndex > mediaIndex);
  assert.doesNotMatch(detailsTab, /ProductMediaGallery/);
  assert.doesNotMatch(detailsTab, /onReportPress/);
});

test("product detail section tabs use underline chrome instead of pill chips", () => {
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const tabBar = readFile(
    MOBILE_ROOT,
    "features/product-detail/ui/ProductDetailTabBar.tsx",
  );
  const layout = readFile(MOBILE_ROOT, "shared/lib/productDetailTabBarLayout.ts");
  const webTabsCss = readFile(
    CLIENT_ROOT,
    "src/entities/product/ui/product-details-modal/ProductDetailsModalTabs.css",
  );
  const tabBarStylesBlock =
    styles.match(/export const useProductDetailTabBarStyles[\s\S]*?}\)\);/)?.[0] ?? "";
  const tabBlock = tabBarStylesBlock.match(/tab:\s*\{([^}]*)\}/)?.[1] ?? "";
  const tabActiveBlock = tabBarStylesBlock.match(/tabActive:\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(tabBar, /useProductDetailTabBarStyles/);
  assert.match(tabBar, /LayoutAnimation/);
  assert.match(tabBar, /withSpring/);
  assert.match(layout, /underlineWidth: 2\.5/);
  assert.match(tabBlock, /backgroundColor:\s*"transparent"/);
  assert.match(tabBlock, /borderRadius:\s*0/);
  assert.match(tabBlock, /borderBottomWidth:/);
  assert.doesNotMatch(tabActiveBlock, /backgroundColor:\s*theme\.colors\.action/);
  assert.match(tabActiveBlock, /borderBottomColor:\s*theme\.colors\.action/);
  assert.match(webTabsCss, /\.product-details-modal__tabs \.modal-section-tabs__tab/);
  assert.match(webTabsCss, /border-bottom:\s*2\.5px solid transparent/);
  assert.match(webTabsCss, /border-radius:\s*0/);
});

test("split wide product detail tabs drop root margin (parent gap only)", () => {
  const tabBar = readFile(
    MOBILE_ROOT,
    "features/product-detail/ui/ProductDetailTabBar.tsx",
  );
  const layout = readFile(MOBILE_ROOT, "shared/lib/productDetailTabBarLayout.ts");
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const pageCss = readFile(
    CLIENT_ROOT,
    "src/pages/product-details/ui/ProductDetailsPage.css",
  );

  assert.match(layout, /wideRootMarginBottom:\s*0/);
  assert.match(styles, /rootWide:[\s\S]*marginBottom:\s*PRODUCT_DETAIL_TAB_BAR_LAYOUT\.wideRootMarginBottom/);
  assert.match(tabBar, /layout === "wide" && styles\.rootWide/);
  assert.doesNotMatch(tabBar, /<View style=\{styles\.root\}/);
  assert.match(
    pageCss,
    /\.product-details-page__wide-tabs[\s\S]*\.product-details-modal__tabs[\s\S]*margin:\s*0/,
  );
});

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
  assert.match(fieldRows, /numberOfLines=\{clampStatValue \? 1 : undefined\}/);
  assert.match(registry, /productPickupAddress:\s*CREATE_PRODUCT_UI\.LABEL_PICKUP_ADDRESS/);
  assert.match(registry, /productPickupAddress/);
  assert.match(registry, /isProductFieldMultilineRead[\s\S]*productPickupAddress/);
});

test("mobile product detail meta grid matches web modal meta rows layout", () => {
  const layout = readFile(MOBILE_ROOT, "entities/product/lib/productDetailsMetaGridLayout.ts");
  const fieldRows = readFile(MOBILE_ROOT, "entities/product/ui/ProductDetailFieldRows.tsx");
  const detailsTab = readFile(MOBILE_ROOT, "features/product-detail/ui/ProductDetailsDetailsTab.tsx");
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const webCss = readFile(
    CLIENT_ROOT,
    "src/entities/product/ui/product-details-modal/ProductDetailsModalFields.css",
  );

  assert.match(layout, /columns: 3/);
  assert.match(layout, /narrowBreakpoint: 576/);
  assert.match(layout, /rowPaddingVertical: 8\.8/);
  assert.match(webCss, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(webCss, /product-details-modal__row--meta/);
  assert.match(fieldRows, /layout === "meta"/);
  assert.match(fieldRows, /metaGridThreeCol/);
  assert.match(fieldRows, /useWindowDimensions/);
  assert.match(detailsTab, /layout="meta"/);
  assert.match(styles, /borderColor: theme\.colors\.surfaceMuted/);
  assert.match(styles, /gridTemplateColumns: "repeat\(3, minmax\(0, 1fr\)\)"/);
});

test("mobile product description panel matches web content-switcher chrome", () => {
  const detailsTab = readFile(MOBILE_ROOT, "features/product-detail/ui/ProductDetailsDetailsTab.tsx");
  const layout = readFile(
    MOBILE_ROOT,
    "entities/product/lib/productDetailsContentSwitcherLayout.ts",
  );
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const webCss = readFile(
    CLIENT_ROOT,
    "src/entities/product/ui/product-details-modal/ProductDetailsContentSwitcher.css",
  );
  const webTabsCss = readFile(CLIENT_ROOT, "src/shared/ui/ModalSectionTabs/ModalSectionTabs.css");
  const panelBlock = styles.match(/contentSwitcherPanel:\s*\{([^}]*)\}/)?.[1] ?? "";
  const tabBlock = styles.match(/contentSwitcherTab:\s*\{([^}]*)\}/)?.[1] ?? "";
  const tabActiveBlock = styles.match(/contentSwitcherTabActive:\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(layout, /tabMinHeight: 36/);
  assert.match(layout, /tabPaddingVertical: 6\.4/);
  assert.match(layout, /tabPaddingHorizontal: 13\.6/);
  assert.match(layout, /tabsGap: 8/);
  assert.match(layout, /sectionGap: 9/);
  assert.match(webTabsCss, /padding: 0\.4rem 0\.85rem/);
  assert.match(webCss, /product-details-content-switcher__panel/);
  assert.match(webCss, /border:\s*1px solid/);
  assert.match(webCss, /background:\s*var\(--iz-color-ink\)/);
  assert.match(detailsTab, /contentSwitcherPanel/);
  assert.match(detailsTab, /styles\.contentSwitcher/);
  assert.match(detailsTab, /descriptionText/);
  assert.match(panelBlock, /borderWidth:\s*CS\.panelBorderWidth/);
  assert.match(panelBlock, /borderColor:\s*theme\.colors\.border/);
  assert.match(panelBlock, /borderRadius:\s*CS\.panelBorderRadius/);
  assert.match(tabBlock, /minHeight:\s*CS\.tabMinHeight/);
  assert.match(tabBlock, /borderColor:\s*theme\.colors\.borderStrong/);
  assert.match(tabActiveBlock, /backgroundColor:\s*theme\.colors\.ink/);
  assert.match(tabActiveBlock, /borderColor:\s*theme\.colors\.ink/);
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
  assert.match(webCss, /product-characteristics-details__row/);
  assert.match(component, /styles\.key/);
  assert.match(component, /styles\.value/);
  assert.match(rowBlock, /flexDirection:\s*"row"/);
  assert.match(rowBlock, /alignItems:\s*"baseline"/);
  assert.match(valueBlock, /textAlign:\s*"left"/);
  assert.match(charStylesBlock, /flex:\s*3/);
});

test("mobile seller preview matches web product-details-seller-preview chrome", () => {
  const layout = readFile(
    MOBILE_ROOT,
    "entities/product/lib/productDetailsSellerPreviewLayout.ts",
  );
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const preview = readFile(MOBILE_ROOT, "entities/product/ui/ProductDetailsSellerPreview.tsx");
  const webCss = readFile(CLIENT_ROOT, "src/entities/product/ui/ProductDetailsSellerPreview.css");
  const webPageCss = readFile(CLIENT_ROOT, "src/pages/product-details/ui/ProductDetailsPage.css");
  const sellerStylesBlock =
    styles.match(/export const useProductDetailsSellerPreviewStyles[\s\S]*?}\)\);/)?.[0] ?? "";

  assert.match(layout, /rootPadding: 14/);
  assert.match(layout, /avatarSize: 56/);
  assert.match(webCss, /padding: 0\.875rem/);
  assert.match(webCss, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(webPageCss, /product-details-modal--page-split \.product-details-seller-preview/);
  assert.match(sellerStylesBlock, /backgroundColor:\s*theme\.colors\.surfaceMuted/);
  assert.match(sellerStylesBlock, /rootSplit:/);
  assert.match(sellerStylesBlock, /marginHorizontal: 0/);
  assert.match(preview, /presentation === "split-rest" && styles\.rootSplit/);
  assert.match(preview, /pressed && styles\.rootPressed/);
  assert.match(sellerStylesBlock, /backgroundColor:\s*theme\.colors\.actionSoft/);
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
  assert.match(webCss, /--iz-color-warning/);
  assert.match(summary, /buildProductReviewSummaryCardStyle/);
  assert.match(background, /buildProductReviewSummaryCardStyle/);
  assert.match(background, /linear-gradient\(145deg/);
  assert.match(palette, /surfaceElevated/);
  assert.match(palette, /warningSurface/);
  assert.match(summaryCardBlock, /overflow:\s*"hidden"/);
  assert.doesNotMatch(summaryCardBlock, /backgroundColor/);

  const reviewsTab = readFile(MOBILE_ROOT, "features/product-detail/ui/ProductReviewsTab.tsx");
  assert.match(reviewsTab, /ProductReviewSummary/);
  assert.doesNotMatch(reviewsTab, /styles\.summaryCard/);
});

test("product detail dock CTA uses AddToCartButton only", () => {
  const purchaseActions = readFile(
    MOBILE_ROOT,
    "features/product-detail/ui/ProductDetailPurchaseActions.tsx",
  );
  const addToCart = readFile(MOBILE_ROOT, "features/cart-add/ui/AddToCartButton.tsx");
  const cartStyles = readFile(MOBILE_ROOT, "shared/theme/uploadFieldStyles.ts");
  const webCss = readFile(CLIENT_ROOT, "src/features/cart-add/ui/AddToCartButton.css");

  assert.match(purchaseActions, /AddToCartButton/);
  assert.match(purchaseActions, /detailOutOfStockButton/);
  assert.match(purchaseActions, /OutOfStockPurchaseButton/);
  assert.doesNotMatch(purchaseActions, /buttonDisabled/);
  assert.doesNotMatch(purchaseActions, /AUCTION_SHORTCUT/);
  assert.doesNotMatch(purchaseActions, /INSTALLMENT_UI\.SHORTCUT/);
  assert.doesNotMatch(purchaseActions, /shortcutsRow/);
  assert.match(addToCart, /SquircleView/);
  assert.match(addToCart, /PRODUCT_DETAIL_DOCK_CTA_BORDER_RADIUS/);
  assert.match(cartStyles, /PRODUCT_DETAIL_DOCK_CTA_BORDER_RADIUS = 11\.2/);
  assert.match(cartStyles, /detailOutOfStockButton:/);
  assert.match(cartStyles, /backgroundColor: theme\.colors\.surfaceMuted/);
  assert.match(webCss, /add-to-cart--out-of-stock/);
  assert.match(webCss, /color: var\(--iz-color-text-muted\)/);
});

test("mobile product detail screen is outside tabs and uses dock-only scroll padding", () => {
  const rootLayout = readFile(MOBILE_ROOT, "app/_layout.tsx");
  const layoutLib = readFile(MOBILE_ROOT, "shared/lib/productDetailScreenLayout.ts");
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const tabLayout = readFile(MOBILE_ROOT, "app/(tabs)/_layout.tsx");

  assert.match(rootLayout, /name="product\/\[id\]"/);
  assert.doesNotMatch(tabLayout, /product\/\[id\]/);
  assert.match(layoutLib, /PRODUCT_DETAIL_DOCK_SCROLL_PADDING = 100/);
  assert.match(styles, /PRODUCT_DETAIL_DOCK_SCROLL_PADDING/);
  assert.doesNotMatch(styles, /DETAIL_DOCK_SCROLL_PADDING = 124/);
});

test("mobile installment tab matches web buyer hint and docked submit", () => {
  const tab = readFile(MOBILE_ROOT, "features/product-detail/ui/ProductInstallmentTab.tsx");
  const screen = readFile(MOBILE_ROOT, "app/product/[id].tsx");
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const webCss = readFile(CLIENT_ROOT, "src/entities/installment/ui/InstallmentBuyerBlock.css");

  assert.match(webCss, /installment-buyer-block__hint/);
  assert.match(webCss, /--iz-color-surface-muted/);
  assert.match(webCss, /--iz-color-text-secondary/);
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
  assert.match(tab, /myOfferQueryEnabled/);
  assert.match(tab, /myOfferQueryEnabled && myOfferQuery\.isLoading/);
  assert.doesNotMatch(tab, /isAuthorized && myOfferQuery\.isPending/);
});
