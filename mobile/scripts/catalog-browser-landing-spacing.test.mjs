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
  const layout = readMobile("features/catalog-browser/lib/catalogBrowserLandingLayout.ts");
  const styles = readMobile("shared/theme/catalogProductStyles.ts");
  const grid = readMobile("features/catalog-browser/ui/CatalogBrowserTilesGrid.tsx");
  const page = readMobile("features/catalog-browser/ui/CatalogBrowserPage.tsx");
  const webCss = readClient(
    "entities/product-category-display/ui/CatalogFeedTilesGrid.css",
  );

  assert.match(webCss, /margin-bottom:\s*0\.75rem/);
  assert.match(webCss, /margin-top:\s*1\.15rem/);
  assert.match(webCss, /margin:\s*0\.65rem 0 0\.95rem/);

  assert.match(layout, /feedMarginBottom: 0/);
  assert.match(layout, /feedPaddingTop: 4/);
  assert.match(layout, /categoriesMarginTop: 10/);
  assert.match(layout, /categoriesPaddingTop: 0/);
  assert.match(layout, /titleMarginTop: 0/);
  assert.match(layout, /titleMarginBottom: 8/);

  assert.match(styles, /sectionFeed:/);
  assert.match(styles, /sectionCategories:/);
  assert.match(styles, /CATALOG_BROWSER_LANDING_LAYOUT\.feedMarginBottom/);
  assert.match(styles, /CATALOG_BROWSER_LANDING_LAYOUT\.categoriesMarginTop/);

  const pageStylesBlock = styles.slice(
    styles.indexOf("export const useCatalogBrowserPageStyles"),
    styles.indexOf("export const useCatalogSubcategoryPickerStyles"),
  );
  assert.doesNotMatch(pageStylesBlock, /^\s*gap:/m);

  assert.match(grid, /variant = "categories"/);
  assert.match(grid, /sectionFeed/);
  assert.match(page, /variant="feed"/);
  assert.match(page, /variant="categories"/);
});
