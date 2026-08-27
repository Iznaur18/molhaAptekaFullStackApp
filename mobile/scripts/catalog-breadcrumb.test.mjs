import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readFile = (root, relativePath) =>
  readFileSync(join(root, relativePath), "utf8");

test("catalog screen uses breadcrumb instead of category chips", () => {
  const catalogScreen = readFile(MOBILE_ROOT, "app/(tabs)/index.tsx");
  const breadcrumb = readFile(MOBILE_ROOT, "features/catalog-filter/ui/CatalogBreadcrumb.tsx");
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const webCss = readFile(
    CLIENT_ROOT,
    "src/entities/product-category-display/ui/CatalogCategoriesGrid.css",
  );

  assert.match(catalogScreen, /CatalogBreadcrumb/);
  assert.match(catalogScreen, /useCatalogBreadcrumbLabel/);
  assert.doesNotMatch(catalogScreen, /CatalogCategoryChips/);
  assert.doesNotMatch(catalogScreen, /CatalogSubcategoryChips/);
  assert.match(breadcrumb, /HOME_PAGE_UI\.BREADCRUMB_CATALOG/);
  assert.match(breadcrumb, /accessibilityRole="header"/);
  assert.match(styles, /title:/);
  assert.match(styles, /paddingTop: 16/);
  assert.match(styles, /HOME_FEED_DISPLAY_TITLE/);
  assert.match(styles, /paddingLeft: HOME_FEED_DISPLAY_TITLE\.paddingLeft/);
  assert.match(styles, /titleCompactTop/);
  assert.match(breadcrumb, /titleCompactTop/);
  assert.match(webCss, /catalog-categories-browser__breadcrumb/);

  const display = readFile(MOBILE_ROOT, "shared/theme/displayTypography.ts");
  assert.match(display, /DISPLAY_FONT_FAMILY = "Intro"/);
  const layout = readFile(MOBILE_ROOT, "app/_layout.tsx");
  assert.match(layout, /IntroDemo-BlackCAPS\.otf/);
});

test("catalog breadcrumb label resolves feed sort like web", () => {
  const resolver = readFile(
    MOBILE_ROOT,
    "entities/product-category-display/lib/resolveActiveCatalogFeedLabel.ts",
  );

  assert.match(resolver, /По просмотрам/);
  assert.match(resolver, /query\.sort/);
});
