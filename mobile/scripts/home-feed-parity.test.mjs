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

  assert.match(index, /invalidateHomeFeedQueries/);
  assert.match(index, /isHomeCuratedProductListsVisible/);
  assert.match(index, /HOME_PAGE_UI\.BREADCRUMB_HOME/);
  assert.match(header, /showCuratedLists/);
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

test("raffle carousel section uses reveal toggle on home feed", () => {
  const styles = readMobileFile("shared/theme/raffleFeaturedStyles.ts");
  const section = readMobileFile("features/home-feed/ui/HomeFeaturedRafflesSection.tsx");
  const reveal = readMobileFile("features/home-feed/ui/HomeFeaturedRafflesRevealButton.tsx");
  const flow = readMobileFile("shared/ui/RainbowFlowBackdrop.tsx");

  assert.match(styles, /revealButton/);
  assert.match(section, /HomeFeaturedRafflesRevealButton/);
  assert.match(section, /isExpanded/);
  assert.match(reveal, /HOME_FEED_UI\.SHOW_RAFFLES/);
  assert.match(reveal, /HOME_FEED_UI\.HIDE_RAFFLES/);
  assert.match(reveal, /RainbowFlowBackdrop/);
  assert.match(flow, /raffle-reveal-rainbow/);
  assert.match(flow, /saturate\(2\)/);
});
