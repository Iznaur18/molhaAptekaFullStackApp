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

test("home catalog screen wires city filter and home-feed refresh", () => {
  const index = readMobileFile("app/(tabs)/index.tsx");
  const header = readMobileFile("features/home-feed/ui/HomeFeedHeader.tsx");

  assert.match(index, /catalogAllCities/);
  assert.match(index, /invalidateHomeFeedQueries/);
  assert.match(index, /isHomeCuratedProductListsVisible/);
  assert.match(index, /HOME_PAGE_UI\.BREADCRUMB_HOME/);
  assert.match(header, /showCuratedLists/);
  assert.match(header, /allCities: catalogAllCities/);
  assert.match(header, /CatalogCityFilterBanner/);
});

test("raffle carousel section margin matches web 1.25rem", () => {
  const styles = readMobileFile("shared/theme/raffleFeaturedStyles.ts");
  const section = readMobileFile("features/home-feed/ui/HomeFeaturedRafflesSection.tsx");

  assert.match(styles, /useRaffleFeaturedSectionStyles/);
  assert.match(styles, /marginTop: BANNER_SECTION_MARGIN/);
  assert.match(styles, /marginBottom: BANNER_SECTION_MARGIN/);
  assert.match(styles, /const BANNER_SECTION_MARGIN = 20/);
  assert.match(section, /HOME_FEED_UI\.RAFFLES_SECTION_TITLE/);
});

test("city filter banner copy matches web HOME_PAGE_UI", () => {
  const source = readMobileFile("shared/config/homePageUi.ts");

  assert.match(source, /CATALOG_CITY_FILTER_BANNER/);
  assert.match(source, /CATALOG_CITY_FILTER_SHOW_ALL/);
});
