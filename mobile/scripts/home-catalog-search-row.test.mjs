import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("HomeCatalogSearchRow: glass panel, logo, header search, users", () => {
  const source = readMobileFile("features/home-feed/ui/HomeCatalogSearchRow.tsx");

  assert.match(source, /HomeCatalogBrandLogo/);
  assert.match(source, /HomeCatalogUsersButton/);
  assert.match(source, /HomeCatalogHeaderPanel/);
  assert.match(source, /HomeCatalogHeaderSearch/);
  assert.doesNotMatch(source, /CatalogSearchBar/);
  assert.doesNotMatch(source, /useAuthSessionQuery/);
});

test("home catalog header panel matches web mobile-split chrome", () => {
  const searchRow = readMobileFile("features/home-feed/ui/HomeCatalogSearchRow.tsx");
  const panel = readMobileFile("features/home-feed/ui/HomeCatalogHeaderPanel.tsx");
  const glass = readMobileFile("features/home-feed/ui/HomeCatalogHeaderGlassLayer.tsx");
  const styles = readMobileFile("shared/theme/homeCatalogHeaderStyles.ts");
  const layout = readMobileFile("shared/lib/homeCatalogHeaderLayout.ts");

  assert.match(panel, /HomeCatalogHeaderAccent/);
  assert.match(panel, /HomeCatalogHeaderGlassLayer/);
  assert.match(panel, /paddingTop/);
  assert.match(glass, /backdropFilter/);
  assert.match(glass, /resolveHomeCatalogHeaderGlassTint/);
  assert.match(styles, /bannerBelowPanel/);
  assert.match(layout, /HOME_CATALOG_HEADER_BANNER_BELOW_PANEL_MARGIN/);
  assert.doesNotMatch(searchRow, /SiteHeaderBannerSlot/);
  assert.match(styles, /backgroundColor: "transparent"/);
  assert.match(styles, /paddingHorizontal: HOME_CATALOG_HEADER_PANEL_PADDING\.horizontal/);
  assert.match(styles, /paddingBottom: HOME_CATALOG_HEADER_PANEL_PADDING\.bottom/);
  assert.match(styles, /HOME_CATALOG_HEADER_SEARCH_INPUT_MIN_HEIGHT/);
  assert.match(styles, /borderTopLeftRadius: 0/);
  assert.match(styles, /borderBottomLeftRadius: HOME_CATALOG_HEADER_PANEL_RADIUS/);
  assert.match(layout, /horizontal: 13\.6/);
  assert.match(layout, /bottom: 12/);
  assert.match(layout, /HOME_CATALOG_HEADER_PANEL_BLUR_RADIUS = 14/);
  assert.match(layout, /HOME_CATALOG_HEADER_BOTTOM_MARGIN = 0/);
  assert.match(layout, /HOME_CATALOG_HEADER_LOGO_MAX_WIDTH_REM = 144/);
});

test("home catalog brand logo uses intrinsic width from aspect ratio", () => {
  const source = readMobileFile("features/home-feed/ui/HomeCatalogBrandLogo.tsx");

  assert.match(source, /resolveHomeCatalogHeaderLogoMaxWidth/);
  assert.match(source, /contentPosition="left center"/);
  assert.match(source, /onLoad=\{handleLogoLoad\}/);
  assert.doesNotMatch(source, /width: 120/);
});

test("HOME_PAGE_UI exposes brand accessibility copy", () => {
  const source = readMobileFile("shared/config/homePageUi.ts");

  assert.match(source, /LOGO_ALT/);
  assert.match(source, /NAV_TO_HOME/);
});
