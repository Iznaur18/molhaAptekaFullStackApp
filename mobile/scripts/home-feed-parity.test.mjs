import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("curated lists visibility mirrors web gate", () => {
  const source = readMobileFile(
    "entities/curated-product-list/lib/isHomeCuratedProductListsVisible.ts",
  );

  assert.match(source, /isHomeCatalogMainView/);
  assert.match(source, /catalogSaleOnly/);
  assert.match(source, /catalogRentalOnly/);
  assert.match(source, /catalogAffiliateOnly/);
  assert.match(source, /catalogWholesaleOnly/);
  assert.match(source, /catalogOriginalOnly/);
});

test("curated home layout uses web card gap", () => {
  const source = readMobileFile(
    "entities/curated-product-list/lib/curatedProductListHomeLayout.ts",
  );

  assert.match(source, /CURATED_PRODUCT_LIST_HOME_CARD_GAP = 12/);
  assert.match(source, /SECTION_PADDING_VERTICAL = 12/);
  assert.match(source, /SECTION_PADDING_HORIZONTAL = 0/);
  assert.match(source, /SCROLL_PADDING_HORIZONTAL = 12/);
  assert.match(source, /SCROLL_PADDING_TOP = 0/);
  assert.match(source, /SCROLL_PADDING_BOTTOM = 0/);
});

test("home feed sellers tab filters storefront tiles like web", () => {
  const index = readMobileFile("app/(tabs)/index.tsx");
  const sellers = readMobileFile("features/home-feed/ui/HomeFeedSellersSection.tsx");
  const tabs = readMobileFile("features/home-feed/ui/HomeFeedSectionTabs.tsx");
  const header = readMobileFile("features/home-feed/ui/HomeFeedListHeader.tsx");

  assert.match(tabs, /CATALOG_HOME_SECTION_SELLERS/);
  assert.match(tabs, /CATALOG_HOME_SECTION_CATEGORIES/);
  assert.match(sellers, /filterSellerStoreTilesBySearch/);
  assert.match(sellers, /router\.push\(`\/seller\/\$\{id\}`\)/);
  assert.match(header, /HomeFeedSellersSection/);
  assert.match(header, /activeTab === "home"/);
  assert.match(index, /activeHomeFeedSectionTab === "home"/);
  assert.match(index, /blockProductSearchRef/);
});

test("home catalog screen wires home-feed refresh", () => {
  const index = readMobileFile("app/(tabs)/index.tsx");
  const header = readMobileFile("features/home-feed/ui/HomeFeedHeader.tsx");
  const invalidate = readMobileFile(
    "features/home-feed/model/invalidateHomeFeedQueries.ts",
  );

  assert.match(index, /invalidateHomeFeedQueries/);
  assert.match(index, /ThemedRefreshControl/);
  assert.match(index, /isPullRefreshing/);
  assert.match(index, /isHomeCuratedProductListsVisible/);
  assert.match(header, /showCuratedLists/);
  assert.match(invalidate, /siteHeaderBannerQueryKeys/);
  assert.match(invalidate, /productPromotionQueryKeys/);
  assert.doesNotMatch(header, /CatalogCityFilterBanner/);
});

test("home boost row mirrors web gate and stack order", () => {
  const header = readMobileFile("features/home-feed/ui/HomeFeedHeader.tsx");
  const section = readMobileFile("entities/product/ui/BoostProductsHomeSection.tsx");
  const query = readMobileFile(
    "entities/product/model/useProductPromotionBoostProductsQuery.ts",
  );
  const keys = readMobileFile("entities/product/model/productPromotionQueryKeys.ts");
  const fetch = readMobileFile(
    "entities/product/api/fetchProductPromotionBoostProducts.ts",
  );
  const homePageUi = readMobileFile("shared/config/homePageUi.ts");
  const webCatalog = readFileSync(
    join(MOBILE_ROOT, "../client/src/shared/config/copy/catalog.js"),
    "utf8",
  );

  assert.match(header, /useProductPromotionBoostProductsQuery/);
  assert.match(header, /BoostProductsHomeSection/);
  assert.match(header, /showBoostProductsRow = enabled && showCuratedLists/);
  assert.match(header, /InlineErrorBanner/);
  assert.match(
    header,
    /boostErrorMessage[\s\S]*InlineErrorBanner[\s\S]*BoostProductsHomeSection/,
  );
  assert.match(
    header,
    /UserStoriesStrip[\s\S]*BoostProductsHomeSection[\s\S]*HomeCuratedListsSection/,
  );
  assert.match(section, /products\.length === 0/);
  assert.match(section, /CuratedListViewAllSheet/);
  assert.match(section, /BoostProductMiniCard/);
  assert.match(query, /staleTime: BOOST_PRODUCTS_STALE_TIME_MS/);
  assert.match(keys, /boost-products/);
  assert.match(fetch, /\/product\/promotions\/boost-products/);
  assert.match(homePageUi, /CATALOG_HOME_SECTION_BOOST_PRODUCTS: "Буст продвижение"/);
  assert.match(webCatalog, /CATALOG_HOME_SECTION_BOOST_PRODUCTS: "Буст продвижение"/);
});

test("home feed sections share one vertical gap constant", () => {
  const layout = readMobileFile("features/home-feed/lib/homeFeedSectionLayout.ts");
  const catalogStyles = readMobileFile("shared/theme/catalogProductStyles.ts");
  const raffle = readMobileFile("shared/theme/raffleFeaturedStyles.ts");
  const stories = readMobileFile("entities/user-story/lib/userStoryStripLayout.ts");
  const curated = readMobileFile(
    "entities/curated-product-list/lib/curatedProductListHomeLayout.ts",
  );
  const header = readMobileFile("shared/theme/homeCatalogHeaderStyles.ts");

  assert.match(layout, /HOME_FEED_SECTION_GAP = 8/);
  assert.match(catalogStyles, /listHeader:[\s\S]*gap: HOME_FEED_SECTION_GAP/);
  assert.match(catalogStyles, /toolbarCompactTop:[\s\S]*marginBottom: 0/);
  assert.match(
    catalogStyles,
    /toolbarCompactTop:[\s\S]*marginTop: -HOME_CATALOG_SECTION_TITLE_COMPACT_PULL_UP/,
  );
  assert.match(
    catalogStyles,
    /titleCompactTop:[\s\S]*HOME_CATALOG_SECTION_TITLE_MARGIN_TOP/,
  );
  assert.match(
    curated,
    /CURATED_PRODUCT_LIST_HOME_SECTION_MARGIN_BOTTOM = HOME_FEED_SECTION_GAP/,
  );
  assert.match(header, /bannerBelowPanel:[\s\S]*marginTop: 0/);
  assert.match(header, /bannerBelowPanel:[\s\S]*marginBottom: 0/);
  assert.match(stories, /marginBottom: 0/);
  assert.match(stories, /paddingTop: 0/);
  assert.doesNotMatch(raffle, /marginTop: HOME_FEED_SECTION_GAP/);

  const display = readMobileFile("shared/theme/displayTypography.ts");
  assert.match(display, /marginTop: 8/);
  assert.match(display, /marginBottom: 16/);
  assert.match(display, /HOME_CATALOG_SECTION_TITLE_MARGIN_TOP = 16/);
  assert.match(
    catalogStyles,
    /homeFeedSearchHeader:[\s\S]*marginBottom: HOME_FEED_SECTION_GAP/,
  );
});

test("stories strip matches web: no title, no card chrome", () => {
  const strip = readMobileFile("features/home-feed/ui/UserStoriesStrip.tsx");
  const styles = readMobileFile("shared/theme/catalogProductStyles.ts");
  const layout = readMobileFile("entities/user-story/lib/userStoryStripLayout.ts");
  const display = readMobileFile("shared/theme/displayTypography.ts");
  const homePageUi = readMobileFile("shared/config/homePageUi.ts");
  const webCatalog = readFileSync(
    join(MOBILE_ROOT, "../client/src/shared/config/copy/catalog.js"),
    "utf8",
  );
  const curatedStylesBlock =
    styles.match(/export const useHomeCuratedListsStyles[\s\S]*?}\)\);/)?.[0] ?? "";
  const storiesStylesBlock =
    styles.match(/export const useUserStoriesStripStyles[\s\S]*?}\)\);/)?.[0] ?? "";
  const curatedTitle = curatedStylesBlock.match(/title:\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(strip, /HorizontalOverflowRow/);
  assert.match(strip, /USER_STORY_STRIP_TRACK_HEIGHT/);
  assert.doesNotMatch(strip, /STORIES_SECTION_TITLE/);
  assert.doesNotMatch(strip, /SquircleView/);
  assert.doesNotMatch(storiesStylesBlock, /scrollWrapper/);
  assert.doesNotMatch(storiesStylesBlock, /title:/);
  assert.match(storiesStylesBlock, /ringAdd:[\s\S]*actionSoft/);
  assert.match(storiesStylesBlock, /plus:[\s\S]*color: theme\.colors\.action/);
  assert.match(layout, /scrollPaddingBottom: 6/);
  assert.match(layout, /scrollPaddingLeft: 2/);
  assert.match(layout, /blockPaddingHorizontal: 0/);
  assert.match(display, /DISPLAY_FONT_FAMILY = izTypography\.fontFamilyDisplay/);
  assert.match(display, /textTransform: "uppercase"/);
  assert.match(curatedTitle, /HOME_FEED_DISPLAY_TITLE/);
  assert.match(curatedTitle, /CURATED_PRODUCT_LIST_HOME_TITLE_MARGIN_BOTTOM/);
  assert.match(styles, /CATALOG_BROWSER_DISPLAY_TITLE/);
  assert.match(homePageUi, /CATALOG_HOME_SECTION_CATEGORIES: "Каталог"/);
  assert.match(webCatalog, /CATALOG_HOME_SECTION_CATEGORIES: "Каталог"/);

  const curatedSection = readMobileFile(
    "features/home-feed/ui/HomeCuratedListsSection.tsx",
  );
  assert.match(
    curatedSection,
    /SquircleView[\s\S]*styles\.listBlock[\s\S]*headerStyles\.header/,
  );
  assert.match(curatedSection, /CURATED_LIST_CAROUSEL_UI\.VIEW_ALL/);
  assert.match(curatedSection, /CuratedListViewAllSheet/);
  const curatedCategories = readMobileFile(
    "features/home-feed/ui/HomeCuratedCategoryListsSection.tsx",
  );
  assert.match(
    curatedCategories,
    /SquircleView[\s\S]*styles\.listBlock[\s\S]*headerStyles\.header/,
  );
  assert.match(curatedCategories, /CuratedListViewAllSheet/);
});

test("curated view-all sheet mirrors web copy and layout tokens", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");
  const sheet = readMobileFile(
    "entities/curated-product-list/ui/CuratedListViewAllSheet.tsx",
  );
  const layout = readMobileFile(
    "entities/curated-product-list/lib/curatedListViewAllSheetLayout.ts",
  );
  const webCopy = readFileSync(
    join(MOBILE_ROOT, "../client/src/shared/config/copy/catalog.js"),
    "utf8",
  );

  assert.match(copy, /CURATED_LIST_CAROUSEL_UI/);
  assert.match(copy, /VIEW_ALL: "Все"/);
  assert.match(copy, /SHEET_CLOSE_ARIA: "Закрыть подборку"/);
  assert.match(webCopy, /VIEW_ALL: "Все"/);
  assert.match(sheet, /useWholesalePriceSheetAnimation/);
  assert.match(sheet, /ModalSheetGradientBackdrop/);
  assert.match(sheet, /resolveCuratedSheetProductCardWidth/);
  assert.match(layout, /borderTopRadius: 32/);
  assert.match(layout, /maxHeightRatio: 0\.85/);
  assert.match(layout, /productCardMinWidth: CURATED_PRODUCT_LIST_HOME_CARD_MIN_WIDTH/);
});

test("tab bar home icon uses lucide House (Home removed in RN package)", () => {
  const tabBar = readMobileFile("shared/ui/MobileBottomTabBar.tsx");
  assert.match(tabBar, /lucide-react-native\/icons\/house/);
  assert.doesNotMatch(tabBar, /lucide-react-native\/icons\/home"/);
});

test("raffle section opens /raffle/:id from reveal button (web parity)", () => {
  const styles = readMobileFile("shared/theme/raffleFeaturedStyles.ts");
  const section = readMobileFile(
    "features/home-feed/ui/HomeFeaturedRafflesSection.tsx",
  );
  const reveal = readMobileFile(
    "features/home-feed/ui/HomeFeaturedRafflesRevealButton.tsx",
  );
  const page = readMobileFile(
    "features/raffle-products-page/ui/RaffleProductsPage.tsx",
  );

  assert.match(styles, /revealButton/);
  assert.match(styles, /revealLabel/);
  assert.match(styles, /revealChevron/);
  assert.match(styles, /RAFFLE_REVEAL_BUTTON_BORDER_RADIUS = 999/);
  assert.match(section, /HomeFeaturedRafflesRevealButton/);
  assert.match(section, /router\.push\(`\/raffle\/\$\{/);
  assert.doesNotMatch(section, /HomeFeaturedRaffleModal/);
  assert.doesNotMatch(section, /isModalOpen/);
  assert.doesNotMatch(section, /isExpanded/);
  assert.doesNotMatch(section, /RaffleFeaturedCarousel/);
  assert.match(reveal, /HOME_FEED_UI\.SHOW_RAFFLES/);
  assert.match(reveal, /lucide-react-native\/icons\/gift/);
  assert.match(reveal, /lucide-react-native\/icons\/chevron-right/);
  assert.match(reveal, /RaffleRevealButtonGradient/);
  assert.doesNotMatch(reveal, /HIDE_RAFFLES/);
  assert.doesNotMatch(reveal, /RainbowFlowBackdrop/);
  assert.doesNotMatch(
    styles,
    /revealButton:\s*\{[^}]*backgroundColor:\s*theme\.colors\.action/s,
  );
  assert.match(page, /RafflePrizeMedia/);
  assert.match(page, /blurBackground/);
  assert.match(page, /contentFit="contain"/);
  assert.match(page, /useFeaturedRafflesQuery/);
  assert.match(page, /pagingEnabled/);
  assert.match(page, /RaffleManageActions/);
});

test("create story modal matches web animation and layout tokens", () => {
  const layout = readMobileFile(
    "entities/user-story/lib/createUserStoryModalLayout.ts",
  );
  const animation = readMobileFile(
    "entities/user-story/model/useCreateUserStoryModalAnimation.ts",
  );
  const modal = readMobileFile("features/home-feed/ui/CreateUserStoryModal.tsx");
  const strip = readMobileFile("features/home-feed/ui/UserStoriesStrip.tsx");
  const chrome = readMobileFile("shared/theme/modalChromeStyles.ts");

  assert.match(layout, /enterMs: 420/);
  assert.match(layout, /heightRatio: 0\.8/);
  assert.match(layout, /borderRadius: 32/);
  assert.match(layout, /backdropScrim: "rgba\(0,0,0,0\.62\)"/);
  assert.match(layout, /captionHeight: 180/);
  assert.match(
    layout,
    /sheetEnterEasingCss: "cubic-bezier\(0\.215, 0\.61, 0\.355, 1\)"/,
  );

  assert.match(animation, /useAdminEditModalAnimation/);
  assert.match(animation, /deferEnterUntilPaint: true/);
  assert.match(animation, /scheduleOpenAfterPaint/);
  assert.match(animation, /transitionProperty: "transform"/);
  assert.match(animation, /exitEasing: enterEasing/);

  assert.match(modal, /useCreateUserStoryModalAnimation/);
  assert.match(modal, /presentationStyle="overFullScreen"/);
  assert.match(modal, /sheetHeight = useMemo\(\(\) => windowHeight \* L\.heightRatio/);
  assert.match(modal, /useCssTransition \? View : Animated\.View/);
  assert.match(modal, /height: sheetHeight, maxHeight: sheetHeight/);
  assert.doesNotMatch(modal, /sheetTranslateY/);

  assert.match(strip, /CreateUserStoryModal/);
  assert.match(strip, /visible={isCreateOpen}/);
  assert.doesNotMatch(strip, /isCreateOpen \?/);

  assert.match(chrome, /borderTopLeftRadius: L\.borderRadius/);
  assert.match(chrome, /MODAL_BACKDROP_SCRIM/);
  assert.match(chrome, /maxWidth: L\.maxWidthWide/);
});

test("home section tabs + sellers search colors match web tokens", () => {
  const styles = readMobileFile("shared/theme/homeFeedSectionTabStyles.ts");
  const webTabs = readFileSync(
    join(MOBILE_ROOT, "../client/src/shared/styles/displayFont.css"),
    "utf8",
  );
  const webSearch = readFileSync(
    join(MOBILE_ROOT, "../client/src/shared/ui/SearchInput/SearchInput.css"),
    "utf8",
  );

  assert.match(
    webTabs,
    /\.home-feed-section-tab[\s\S]*color:\s*var\(--iz-color-text-secondary\)/,
  );
  assert.match(styles, /tabLabel:[\s\S]*color:\s*theme\.colors\.textSecondary/);
  assert.doesNotMatch(styles, /tabLabel:[\s\S]*color:\s*theme\.colors\.textMuted/);

  assert.match(
    webSearch,
    /\.search-input__field[\s\S]*background:\s*var\(--iz-color-surface\)/,
  );
  assert.match(
    webSearch,
    /\.search-input__field[\s\S]*border:\s*1px solid var\(--iz-color-border\)/,
  );
  assert.match(styles, /searchInput:[\s\S]*backgroundColor:\s*theme\.colors\.surface/);
  assert.match(styles, /searchInput:[\s\S]*borderColor:\s*theme\.colors\.border/);
  assert.match(styles, /paddingVertical:\s*8\.8/);
  assert.match(styles, /fontSize:\s*15\.2/);
  assert.match(styles, /searchInputFocused/);
  assert.doesNotMatch(styles, /searchInput:[\s\S]*minHeight:\s*44/);
  assert.doesNotMatch(styles, /backgroundColor:\s*`\$\{theme\.colors\.text\}12`/);

  assert.match(webTabs, /\.home-feed-section-tabs[\s\S]*gap:\s*0\.6rem/);
  assert.match(webTabs, /\.home-feed-section-tab[\s\S]*padding:\s*0\.5rem 1rem/);
  assert.match(styles, /row:[\s\S]*gap:\s*9\.6/);
  assert.match(styles, /tab:[\s\S]*paddingHorizontal:\s*16/);
  assert.match(styles, /tabLabel:[\s\S]*fontSize:\s*15\.2/);
});
