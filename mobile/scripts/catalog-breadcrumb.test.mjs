import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readFile = (root, relativePath) => readFileSync(join(root, relativePath), "utf8");

test("catalog screen uses trail breadcrumb like web CatalogBrowserBreadcrumb", () => {
  const catalogScreen = readFile(MOBILE_ROOT, "app/(tabs)/index.tsx");
  const breadcrumb = readFile(
    MOBILE_ROOT,
    "features/catalog-filter/ui/CatalogBreadcrumb.tsx",
  );
  const header = readFile(MOBILE_ROOT, "features/home-feed/ui/HomeFeedListHeader.tsx");
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const webCss = readFile(
    CLIENT_ROOT,
    "src/entities/product-category-display/ui/CatalogCategoriesGrid.css",
  );
  const webBreadcrumb = readFile(
    CLIENT_ROOT,
    "src/entities/product-category-display/ui/CatalogBrowserBreadcrumb.jsx",
  );

  assert.match(catalogScreen, /CatalogBreadcrumb/);
  assert.match(catalogScreen, /useCatalogBreadcrumbLabel/);
  assert.match(catalogScreen, /handleCatalogRootPress/);
  assert.match(catalogScreen, /\/\(tabs\)\/catalog/);
  assert.doesNotMatch(catalogScreen, /CatalogCategoryChips/);
  assert.doesNotMatch(catalogScreen, /CatalogSubcategoryChips/);

  assert.match(breadcrumb, /HOME_PAGE_UI\.BREADCRUMB_CATALOG/);
  assert.match(breadcrumb, /variant = "trail"/);
  assert.match(breadcrumb, /onCatalogRootPress/);
  assert.match(breadcrumb, /›/);
  assert.match(header, /variant="trail"/);
  assert.match(header, /variant="display"/);
  assert.match(header, /onCatalogRootPress/);

  assert.match(styles, /displayTitleCompactTop/);
  assert.match(styles, /HOME_FEED_DISPLAY_TITLE/);
  assert.match(styles, /paddingLeft: HOME_FEED_DISPLAY_TITLE\.paddingLeft/);
  assert.match(styles, /borderRadius: theme\.radius\.pill/);
  assert.match(webCss, /catalog-categories-browser__breadcrumb/);
  assert.match(webBreadcrumb, /BREADCRUMB_CATALOG/);

  const display = readFile(MOBILE_ROOT, "shared/theme/displayTypography.ts");
  assert.match(display, /DISPLAY_FONT_FAMILY = izTypography\.fontFamilyDisplay/);
  const layout = readFile(MOBILE_ROOT, "app/_layout.tsx");
  assert.match(layout, /IntroDemo-BlackCAPS\.otf/);
});

test("orphan catalog chips/searchbar removed (live path: search row + filters sheet)", () => {
  const orphans = [
    "features/catalog-filter/ui/CatalogCategoryChips.tsx",
    "features/catalog-filter/ui/CatalogSubcategoryChips.tsx",
    "features/catalog-filter/ui/CatalogSearchBar.tsx",
  ];
  for (const rel of orphans) {
    assert.equal(existsSync(join(MOBILE_ROOT, rel)), false, `${rel} ещё жив`);
  }

  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  assert.doesNotMatch(styles, /useCatalogFilterChipStyles/);
  assert.doesNotMatch(styles, /useCatalogSearchBarStyles/);
  assert.doesNotMatch(styles, /useCatalogSubcategoryChipStyles/);

  const index = readFile(MOBILE_ROOT, "app/(tabs)/index.tsx");
  const searchRow = readFile(
    MOBILE_ROOT,
    "features/home-feed/ui/HomeCatalogSearchRow.tsx",
  );
  assert.match(index, /HomeCatalogSearchRow/);
  assert.match(index, /HomeCatalogFiltersSheet/);
  assert.doesNotMatch(index, /CatalogSearchBar/);
  assert.doesNotMatch(searchRow, /CatalogSearchBar/);

  const copy = readFile(MOBILE_ROOT, "shared/config/appUiCopy.ts");
  const barrel = readFile(MOBILE_ROOT, "shared/config/index.ts");
  assert.doesNotMatch(copy, /export const CATALOG_FILTER_UI/);
  assert.doesNotMatch(barrel, /CATALOG_FILTER_UI/);
});

test("catalog breadcrumb label resolves feed sort like web", () => {
  const resolver = readFile(
    MOBILE_ROOT,
    "entities/product-category-display/lib/resolveActiveCatalogFeedLabel.ts",
  );
  const hook = readFile(
    MOBILE_ROOT,
    "features/catalog-filter/model/useCatalogBreadcrumbLabel.ts",
  );

  assert.match(resolver, /По просмотрам/);
  assert.match(resolver, /query\.sort/);
  assert.match(resolver, /query\.buyNFreeOnly/);
  assert.match(resolver, /Бесплатно от/);
  assert.match(hook, /buyNFreeOnly:\s*feedFilters\.buyNFreeOnly/);
  assert.match(hook, /feedFilters\.buyNFreeOnly/);
});

test("category/filter view has no search row (только breadcrumb)", () => {
  const catalogScreen = readFile(MOBILE_ROOT, "app/(tabs)/index.tsx");
  assert.match(catalogScreen, /homeFeedSearchRow = showHomeFeed \?/);
  assert.match(catalogScreen, /categoryViewContentStyle/);
  assert.doesNotMatch(catalogScreen, /renderFilteredCatalogChrome/);
  assert.doesNotMatch(catalogScreen, /catalogSearchChrome/);
  const categoryReturnIdx = catalogScreen.lastIndexOf("categoryViewContentStyle");
  assert.ok(categoryReturnIdx > 0);
  const categoryTail = catalogScreen.slice(categoryReturnIdx);
  assert.doesNotMatch(categoryTail, /homeFeedSearchRow/);
  assert.doesNotMatch(categoryTail, /HomeCatalogSearchRow/);
});

test("category breadcrumb→grid gap totals web 1rem (compensate FlatList gap)", () => {
  const catalogScreen = readFile(MOBILE_ROOT, "app/(tabs)/index.tsx");
  const breadcrumb = readFile(
    MOBILE_ROOT,
    "features/catalog-filter/ui/CatalogBreadcrumb.tsx",
  );
  assert.match(breadcrumb, /CATALOG_BROWSER_TOOLBAR_MARGIN_BOTTOM = 16/);
  assert.match(catalogScreen, /CATALOG_BROWSER_TOOLBAR_MARGIN_BOTTOM - productGrid\.gap/);
  assert.match(catalogScreen, /catalogBreadcrumbToolbarMarginBottom/);
});
