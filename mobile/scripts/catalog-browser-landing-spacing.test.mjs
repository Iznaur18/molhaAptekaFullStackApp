import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(ROOT, "../client/src");

const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT, p), "utf8");

test("catalog browser landing section gaps match web CSS", () => {
  const layout = readMobile(
    "features/catalog-browser/lib/catalogBrowserLandingLayout.ts",
  );
  const styles = readMobile("shared/theme/catalogProductStyles.ts");
  const grid = readMobile("features/catalog-browser/ui/CatalogBrowserTilesGrid.tsx");
  const page = readMobile("features/catalog-browser/ui/CatalogBrowserPage.tsx");
  const webCss = readClient(
    "entities/product-category-display/ui/CatalogFeedTilesGrid.css",
  );

  assert.match(webCss, /margin-bottom:\s*0\.75rem/);
  assert.match(webCss, /padding-top:\s*0\.5rem/);
  assert.match(webCss, /margin-top:\s*1\.15rem/);
  assert.match(webCss, /padding-top:\s*0\.35rem/);
  assert.match(webCss, /margin:\s*0\.65rem 0 0\.95rem/);
  assert.match(webCss, /gap:\s*0\.55rem/);
  assert.match(webCss, /width:\s*0\.22rem/);
  assert.match(webCss, /height:\s*1\.05em/);
  assert.match(webCss, /linear-gradient\(\s*180deg/);

  assert.match(layout, /feedPaddingTop: 8/);
  assert.match(layout, /feedMarginBottom: 12/);
  assert.match(layout, /categoriesMarginTop: 18\.4/);
  assert.match(layout, /categoriesPaddingTop: 5\.6/);
  assert.match(layout, /titleMarginTop: 10\.4/);
  assert.match(layout, /titleMarginBottom: 15\.2/);
  assert.match(layout, /titleGap: 8\.8/);
  assert.match(layout, /titleAccentWidth: 3\.5/);
  assert.match(layout, /titleAccentHeightFeed: 23\.1/);
  assert.match(layout, /titleAccentHeightCategories: 21/);

  assert.match(styles, /sectionFeed:/);
  assert.match(styles, /sectionCategories:/);
  assert.match(styles, /sectionTitleRow:/);
  assert.match(styles, /CATALOG_BROWSER_LANDING_LAYOUT\.feedMarginBottom/);
  assert.match(styles, /CATALOG_BROWSER_LANDING_LAYOUT\.categoriesMarginTop/);
  assert.match(styles, /CATALOG_BROWSER_LANDING_LAYOUT\.titleGap/);
  assert.doesNotMatch(styles, /borderLeftWidth:\s*CATALOG_BROWSER_LANDING_LAYOUT/);

  const pageStylesBlock = styles.slice(
    styles.indexOf("export const useCatalogBrowserPageStyles"),
    styles.indexOf("export const useCatalogSubcategoryPickerStyles"),
  );
  assert.doesNotMatch(pageStylesBlock, /^\s*gap:/m);

  assert.match(grid, /variant = "categories"/);
  assert.match(grid, /sectionFeed/);
  assert.match(grid, /CatalogSectionTitleAccent/);
  assert.match(grid, /sectionTitleRow/);
  assert.match(page, /variant="feed"/);
  assert.match(page, /variant="categories"/);
  assert.doesNotMatch(page, /personalCategoryTiles/);
  assert.doesNotMatch(page, /SELLER_PERSONAL_CATEGORY_PAGE_UI/);
});

test("catalog section title accent uses vertical action→accent gradient", () => {
  const accent = readMobile(
    "features/catalog-browser/ui/CatalogSectionTitleAccent.tsx",
  );
  assert.match(accent, /mixHexColors\(theme\.colors\.action, theme\.colors\.accent, 0\.55\)/);
  assert.match(accent, /x1="0" y1="0" x2="0" y2="1"/);
  assert.match(accent, /LinearGradient/);
});
