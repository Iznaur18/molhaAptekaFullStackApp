import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";

export const CATALOG_BROWSER_PAGE_PADDING = SCREEN_CONTENT_PADDING_HORIZONTAL;

/**
 * Паритет с `client/.../CatalogCategoriesGrid.css`:
 *   < 640px  → 3 колонки
 *   640-899px → 4 колонки
 *   ≥ 900px  → 6 колонок
 */
const CATALOG_BROWSER_TILE_BREAKPOINT_4_COL = 640;
const CATALOG_BROWSER_TILE_BREAKPOINT_6_COL = 900;

/** gap: 0.375rem = 6px — паритет с web */
const CATALOG_BROWSER_TILE_GAP_PX = 6;

export const CATALOG_BROWSER_GRID_GAP = CATALOG_BROWSER_TILE_GAP_PX;

export const resolveCatalogBrowserGridColumns = (screenWidth: number): number => {
  if (screenWidth >= CATALOG_BROWSER_TILE_BREAKPOINT_6_COL) return 6;
  if (screenWidth >= CATALOG_BROWSER_TILE_BREAKPOINT_4_COL) return 4;
  return 3;
};

export const resolveCatalogBrowserGridGap = (_screenWidth: number): number =>
  CATALOG_BROWSER_TILE_GAP_PX;

export const catalogBrowserProductGridResolvers = {
  resolveColumns: ({ width }: { width: number; height: number }) =>
    resolveCatalogBrowserGridColumns(width),
  resolveGap: resolveCatalogBrowserGridGap,
};
