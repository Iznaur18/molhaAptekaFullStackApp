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

test("home catalog screen wires home-feed refresh", () => {
  const index = readMobileFile("app/(tabs)/index.tsx");
  const header = readMobileFile("features/home-feed/ui/HomeFeedHeader.tsx");
  const invalidate = readMobileFile("features/home-feed/model/invalidateHomeFeedQueries.ts");

  assert.match(index, /invalidateHomeFeedQueries/);
  assert.match(index, /ThemedRefreshControl/);
  assert.match(index, /isPullRefreshing/);
  assert.match(index, /isHomeCuratedProductListsVisible/);
  assert.match(header, /showCuratedLists/);
  assert.match(invalidate, /siteHeaderBannerQueryKeys/);
  assert.doesNotMatch(header, /CatalogCityFilterBanner/);
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
  assert.match(catalogStyles, /toolbarCompactTop:[\s\S]*marginTop: -HOME_CATALOG_SECTION_TITLE_COMPACT_PULL_UP/);
  assert.match(catalogStyles, /titleCompactTop:[\s\S]*HOME_CATALOG_SECTION_TITLE_MARGIN_TOP/);
  assert.match(curated, /CURATED_PRODUCT_LIST_HOME_SECTION_MARGIN_BOTTOM = HOME_FEED_SECTION_GAP/);
  assert.match(header, /bannerBelowPanel:[\s\S]*marginTop: 0/);
  assert.match(header, /bannerBelowPanel:[\s\S]*marginBottom: 0/);
  assert.match(stories, /marginBottom: 0/);
  assert.match(stories, /paddingTop: 0/);
  assert.doesNotMatch(raffle, /marginTop: HOME_FEED_SECTION_GAP/);

  const display = readMobileFile("shared/theme/displayTypography.ts");
  assert.match(display, /marginTop: 11/);
  assert.match(display, /marginBottom: 6/);
  assert.match(catalogStyles, /homeFeedSearchHeader:[\s\S]*marginBottom: HOME_FEED_SECTION_GAP/);
});

test("stories strip section title matches curated list title chrome", () => {
  const strip = readMobileFile("features/home-feed/ui/UserStoriesStrip.tsx");
  const styles = readMobileFile("shared/theme/catalogProductStyles.ts");
  const display = readMobileFile("shared/theme/displayTypography.ts");
  const copy = readMobileFile("shared/config/appUiCopy.ts");
  const curatedStylesBlock =
    styles.match(/export const useHomeCuratedListsStyles[\s\S]*?}\)\);/)?.[0] ?? "";
  const storiesStylesBlock =
    styles.match(/export const useUserStoriesStripStyles[\s\S]*?}\)\);/)?.[0] ?? "";
  const curatedTitle = curatedStylesBlock.match(/title:\s*\{([^}]*)\}/)?.[1] ?? "";
  const storiesTitle = storiesStylesBlock.match(/title:\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(copy, /STORIES_SECTION_TITLE: "История"/);
  assert.match(strip, /HOME_FEED_UI\.STORIES_SECTION_TITLE/);
  assert.match(strip, /styles\.title/);
  assert.match(
    strip,
    /styles\.title[\s\S]*SquircleView[\s\S]*styles\.scrollWrapper/,
  );
  assert.match(display, /DISPLAY_FONT_FAMILY = "Intro"/);
  assert.match(display, /textTransform: "uppercase"/);
  assert.match(storiesTitle, /HOME_FEED_DISPLAY_TITLE/);
  assert.match(curatedTitle, /HOME_FEED_DISPLAY_TITLE/);
  assert.match(styles, /CATALOG_BROWSER_DISPLAY_TITLE/);

  const curatedSection = readMobileFile("features/home-feed/ui/HomeCuratedListsSection.tsx");
  assert.match(
    curatedSection,
    /styles\.title[\s\S]*SquircleView[\s\S]*styles\.listBlock/,
  );
  const curatedCategories = readMobileFile(
    "features/home-feed/ui/HomeCuratedCategoryListsSection.tsx",
  );
  assert.match(
    curatedCategories,
    /styles\.title[\s\S]*SquircleView[\s\S]*styles\.listBlock/,
  );
});

test("raffle section opens /raffle/:id from reveal button (web parity)", () => {
  const styles = readMobileFile("shared/theme/raffleFeaturedStyles.ts");
  const section = readMobileFile("features/home-feed/ui/HomeFeaturedRafflesSection.tsx");
  const reveal = readMobileFile("features/home-feed/ui/HomeFeaturedRafflesRevealButton.tsx");
  const page = readMobileFile("features/raffle-products-page/ui/RaffleProductsPage.tsx");

  assert.match(styles, /revealButton/);
  assert.match(styles, /theme\.colors\.action/);
  assert.match(section, /HomeFeaturedRafflesRevealButton/);
  assert.match(section, /router\.push\(`\/raffle\/\$\{/);
  assert.doesNotMatch(section, /HomeFeaturedRaffleModal/);
  assert.doesNotMatch(section, /isModalOpen/);
  assert.doesNotMatch(section, /isExpanded/);
  assert.doesNotMatch(section, /RaffleFeaturedCarousel/);
  assert.match(reveal, /HOME_FEED_UI\.SHOW_RAFFLES/);
  assert.doesNotMatch(reveal, /HIDE_RAFFLES/);
  assert.doesNotMatch(reveal, /RainbowFlowBackdrop/);
  assert.match(page, /RafflePrizeMedia/);
  assert.match(page, /blurBackground/);
  assert.match(page, /contentFit="contain"/);
  assert.match(page, /useFeaturedRafflesQuery/);
  assert.match(page, /pagingEnabled/);
  assert.match(page, /RaffleManageActions/);
});

test("create story modal matches web animation and layout tokens", () => {
  const layout = readMobileFile("entities/user-story/lib/createUserStoryModalLayout.ts");
  const animation = readMobileFile("entities/user-story/model/useCreateUserStoryModalAnimation.ts");
  const modal = readMobileFile("features/home-feed/ui/CreateUserStoryModal.tsx");
  const strip = readMobileFile("features/home-feed/ui/UserStoriesStrip.tsx");
  const chrome = readMobileFile("shared/theme/modalChromeStyles.ts");

  assert.match(layout, /enterMs: 420/);
  assert.match(layout, /heightRatio: 0\.8/);
  assert.match(layout, /borderRadius: 32/);
  assert.match(layout, /backdropScrim: "rgba\(0,0,0,0\.62\)"/);
  assert.match(layout, /captionHeight: 180/);
  assert.match(layout, /sheetEnterEasingCss: "cubic-bezier\(0\.215, 0\.61, 0\.355, 1\)"/);

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
  assert.match(chrome, /backgroundColor: L\.backdropScrim/);
  assert.match(chrome, /maxWidth: L\.maxWidthWide/);
});
