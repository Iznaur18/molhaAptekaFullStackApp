import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

const readRepoFile = (relativePath) =>
  readFileSync(join(REPO_ROOT, relativePath), "utf8");

const SCREEN_CONTENT_PADDING_HORIZONTAL = 8;
const CATALOG_BROWSER_GRID_GAP = 6;

// Mirror of catalogBrowserGridConstants.ts
const resolveCatalogBrowserGridColumns = (screenWidth) => {
  if (screenWidth >= 900) return 6;
  if (screenWidth >= 641) return 4;
  return 3;
};

// Mirror of resolveGridTileWidth.ts
const resolveGridTileWidth = (contentWidth, columns, gap) => {
  const totalGap = gap * Math.max(0, columns - 1);
  return Math.floor((contentWidth - totalGap) / columns);
};

const resolveCatalogBrowserTileLayout = (viewportWidth, scrollbarWidth = 0) => {
  const layoutWidth = viewportWidth - scrollbarWidth;
  const columns = resolveCatalogBrowserGridColumns(layoutWidth);
  const contentWidth = layoutWidth - SCREEN_CONTENT_PADDING_HORIZONTAL * 2;
  const gap = CATALOG_BROWSER_GRID_GAP;
  const tileWidth = resolveGridTileWidth(contentWidth, columns, gap);
  const rowWidth = tileWidth * columns + gap * (columns - 1);

  return { columns, contentWidth, tileWidth, rowWidth };
};

test("catalog browser grid: 3 columns at 342px viewport with scrollbar", () => {
  const layout = resolveCatalogBrowserTileLayout(342, 15);

  assert.equal(layout.columns, 3);
  assert.ok(layout.rowWidth <= layout.contentWidth);
});

test("catalog browser grid: 3 columns at iPhone 16 Pro Max width", () => {
  const layout = resolveCatalogBrowserTileLayout(440, 0);

  assert.equal(layout.columns, 3);
  assert.ok(layout.rowWidth <= layout.contentWidth);
});

test("catalog browser grid breakpoints match web CatalogCategoriesGrid.css", () => {
  const constants = readRepoFile(
    "mobile/features/catalog-browser/lib/catalogBrowserGridConstants.ts",
  );
  const webCss = readRepoFile(
    "client/src/entities/product-category-display/ui/CatalogCategoriesGrid.css",
  );

  assert.match(webCss, /--catalog-categories-grid-gap:\s*0\.375rem/);
  assert.match(webCss, /--catalog-categories-grid-radius:\s*0\.75rem/);
  assert.match(webCss, /@media \(min-width: 641px\)/);
  assert.match(webCss, /@media \(min-width: 900px\)/);
  assert.match(constants, /CATALOG_BROWSER_TILE_BREAKPOINT_4_COL = 641/);
  assert.match(constants, /CATALOG_BROWSER_TILE_BREAKPOINT_6_COL = 900/);
  assert.match(constants, /CATALOG_BROWSER_TILE_GAP_PX = 6/);
  assert.equal(resolveCatalogBrowserGridColumns(640), 3);
  assert.equal(resolveCatalogBrowserGridColumns(641), 4);
  assert.equal(resolveCatalogBrowserGridColumns(900), 6);
});

test("catalog browser tile card uses fluid width on web", () => {
  const source = readRepoFile(
    "mobile/features/catalog-browser/ui/CatalogBrowserTileCard.tsx",
  );

  assert.match(source, /resolveFlexGridItemWidthStyle/);
  assert.match(source, /Platform\.OS === "web"/);
});

test("useProductGridLayout accounts for web viewport client width", () => {
  const source = readRepoFile("mobile/shared/model/useProductGridLayout.ts");

  assert.match(source, /resolveViewportLayoutWidth/);
  assert.match(source, /resolveGridTileWidth/);
  assert.match(source, /reservedLeadingWidth/);
});

test("profile hub reserves sidebar width for product grids", () => {
  const layout = readRepoFile("mobile/shared/lib/guestProfileLayout.ts");
  assert.match(layout, /resolveProfileHubMainReservedWidth/);
  assert.match(layout, /MY_PROFILE_SIDEBAR_WIDTH \+ MY_PROFILE_LAYOUT_GAP/);
});
