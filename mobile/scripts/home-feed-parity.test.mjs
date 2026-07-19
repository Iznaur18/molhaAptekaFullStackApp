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
  assert.match(source, /showHiddenCatalogProducts/);
  assert.match(source, /catalogSaleOnly/);
});

test("curated home layout uses web card gap", () => {
  const source = readMobileFile(
    "entities/curated-product-list/lib/curatedProductListHomeLayout.ts",
  );

  assert.match(source, /CURATED_PRODUCT_LIST_HOME_CARD_GAP = 12/);
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
  assert.match(catalogStyles, /toolbarCompactTop:[\s\S]*marginBottom: HOME_FEED_SECTION_GAP/);
  assert.match(curated, /CURATED_PRODUCT_LIST_HOME_SECTION_MARGIN_BOTTOM = HOME_FEED_SECTION_GAP/);
  assert.match(header, /bannerBelowPanel:[\s\S]*marginBottom: 0/);
  assert.match(stories, /marginBottom: 0/);
  assert.match(stories, /paddingTop: 0/);
  assert.doesNotMatch(raffle, /marginTop: HOME_FEED_SECTION_GAP/);
});

test("stories strip section title matches curated list title chrome", () => {
  const strip = readMobileFile("features/home-feed/ui/UserStoriesStrip.tsx");
  const styles = readMobileFile("shared/theme/catalogProductStyles.ts");
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
  assert.match(storiesTitle, /fontSize:\s*16/);
  assert.match(storiesTitle, /fontWeight:\s*"600"/);
  assert.match(storiesTitle, /letterSpacing:\s*-0\.4/);
  assert.match(curatedTitle, /fontSize:\s*16/);
  assert.match(curatedTitle, /fontWeight:\s*"600"/);
  assert.match(curatedTitle, /letterSpacing:\s*-0\.4/);
});

test("raffle section opens featured modal from reveal button", () => {
  const styles = readMobileFile("shared/theme/raffleFeaturedStyles.ts");
  const section = readMobileFile("features/home-feed/ui/HomeFeaturedRafflesSection.tsx");
  const reveal = readMobileFile("features/home-feed/ui/HomeFeaturedRafflesRevealButton.tsx");
  const modal = readMobileFile("features/home-feed/ui/HomeFeaturedRaffleModal.tsx");
  const card = readMobileFile("entities/raffle/ui/FeaturedRaffleModalCard.tsx");

  assert.match(styles, /revealButton/);
  assert.match(styles, /theme\.colors\.action/);
  assert.match(styles, /useFeaturedRaffleModalStyles/);
  assert.match(section, /HomeFeaturedRafflesRevealButton/);
  assert.match(section, /HomeFeaturedRaffleModal/);
  assert.match(section, /isModalOpen/);
  assert.doesNotMatch(section, /isExpanded/);
  assert.doesNotMatch(section, /RaffleFeaturedCarousel/);
  assert.match(reveal, /HOME_FEED_UI\.SHOW_RAFFLES/);
  assert.doesNotMatch(reveal, /HIDE_RAFFLES/);
  assert.doesNotMatch(reveal, /RainbowFlowBackdrop/);
  assert.match(modal, /transparent/);
  assert.match(modal, /FeaturedRaffleModalCard/);
  assert.match(modal, /styles\.footerButton/);
  assert.match(modal, /OPEN_PRODUCTS/);
  assert.doesNotMatch(card, /OPEN_PRODUCTS/);
});
