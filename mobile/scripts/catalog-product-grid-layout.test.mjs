import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

const readRepoFile = (relativePath) =>
  readFileSync(join(REPO_ROOT, relativePath), "utf8");

// Mirror of mobile/shared/lib/catalogProductGridLayout.ts
const CATALOG_PRODUCT_GRID_REM_BASE_PX = 16;
const CATALOG_PRODUCT_GRID_COLUMN_BREAKPOINT_PX = 903;
const CATALOG_PRODUCT_GRID_NARROW_BREAKPOINT_PX = 667;
const CATALOG_PRODUCT_GRID_MOBILE_COLUMNS = 3;
const CATALOG_PRODUCT_GRID_MIN_COLUMNS = 3;
const CATALOG_PRODUCT_GRID_MIN_COLUMN_PX = 280;
const CATALOG_PRODUCT_GRID_GAP_DESKTOP_PX = 16;

const resolveCatalogProductGridGapPx = (viewportWidth) => {
  if (viewportWidth <= CATALOG_PRODUCT_GRID_NARROW_BREAKPOINT_PX) {
    return CATALOG_PRODUCT_GRID_REM_BASE_PX * 0.1;
  }
  if (viewportWidth <= CATALOG_PRODUCT_GRID_COLUMN_BREAKPOINT_PX) {
    return CATALOG_PRODUCT_GRID_REM_BASE_PX * 0.15;
  }
  return CATALOG_PRODUCT_GRID_GAP_DESKTOP_PX;
};

const resolveCatalogProductGridColumns = (viewportWidth) => {
  if (!Number.isFinite(viewportWidth) || viewportWidth <= 0) {
    return CATALOG_PRODUCT_GRID_MIN_COLUMNS;
  }
  if (viewportWidth <= CATALOG_PRODUCT_GRID_COLUMN_BREAKPOINT_PX) {
    return CATALOG_PRODUCT_GRID_MOBILE_COLUMNS;
  }
  const gap = CATALOG_PRODUCT_GRID_GAP_DESKTOP_PX;
  return Math.max(
    CATALOG_PRODUCT_GRID_MIN_COLUMNS,
    Math.floor(
      (viewportWidth + gap) / (CATALOG_PRODUCT_GRID_MIN_COLUMN_PX + gap),
    ),
  );
};

test("mobile catalog grid: min 3 columns enforced in source", () => {
  const mobileSource = readRepoFile("mobile/shared/lib/catalogProductGridLayout.ts");

  assert.match(mobileSource, /CATALOG_PRODUCT_GRID_MIN_COLUMNS = CATALOG_PRODUCT_GRID_MOBILE_COLUMNS/);
  assert.doesNotMatch(mobileSource, /NARROW_COLUMNS = 2/);
});

test("web catalog grid constants: 903 breakpoint + min column width", () => {
  const webConstants = readRepoFile(
    "client/src/widgets/catalog-product-grid/lib/catalogGridVirtualizationConstants.js",
  );

  for (const token of [
    "CATALOG_GRID_COLUMN_BREAKPOINT_PX = 903",
    "CATALOG_GRID_MOBILE_COLUMNS = 3",
    "CATALOG_GRID_MIN_COLUMN_PX = 280",
    "CATALOG_GRID_GAP_PX = 16",
  ]) {
    assert.match(webConstants, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("web AppShell.css: 3 cols up to 903px", () => {
  const css = readRepoFile("client/src/app/ui/AppShell.css");

  assert.match(css, /@media \(max-width: 903px\)[\s\S]*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 903px\)[\s\S]*gap: 0\.15rem/);
});

test("resolveCatalogProductGridColumns: never below 3", () => {
  assert.equal(resolveCatalogProductGridColumns(320), 3);
  assert.equal(resolveCatalogProductGridColumns(667), 3);
  assert.equal(resolveCatalogProductGridColumns(768), 3);
  assert.equal(resolveCatalogProductGridColumns(903), 3);
  assert.equal(resolveCatalogProductGridColumns(904), 3);
  assert.equal(resolveCatalogProductGridColumns(1280), 4);
});

test("catalog browser grid uses web-parity resolvers only", () => {
  const catalogBrowser = readRepoFile(
    "mobile/features/catalog-browser/lib/useCatalogBrowserGridLayout.ts",
  );
  const screenBreakpoints = readRepoFile("mobile/shared/lib/screenBreakpoints.ts");

  assert.match(catalogBrowser, /catalogBrowserProductGridResolvers/);
  assert.match(catalogBrowser, /resolveCatalogBrowserGridColumns/);
  assert.doesNotMatch(screenBreakpoints, /resolveCatalogProductGridColumns/);
});

test("resolveCatalogProductGridGapPx matches web rem gaps", () => {
  assert.equal(resolveCatalogProductGridGapPx(390), 1.6);
  assert.equal(resolveCatalogProductGridGapPx(667), 1.6);
  assert.equal(resolveCatalogProductGridGapPx(768), 2.4);
  assert.equal(resolveCatalogProductGridGapPx(903), 2.4);
  assert.equal(resolveCatalogProductGridGapPx(1280), 16);
});
