import {
  CATALOG_PRODUCT_GRID_COLUMN_BREAKPOINT_PX,
  CATALOG_PRODUCT_GRID_MIN_COLUMNS,
  CATALOG_PRODUCT_GRID_MOBILE_COLUMNS,
  CATALOG_PRODUCT_GRID_NARROW_BREAKPOINT_PX,
  resolveCatalogProductGridColumns,
  resolveCatalogProductGridGapPx,
} from "@/shared/lib/catalogProductGridLayout";
import {
  SCREEN_LARGE_TABLET_MIN_WIDTH,
  SCREEN_MEDIUM_TABLET_MIN_WIDTH,
  SCREEN_NARROW_MAX_WIDTH,
  SCREEN_SMALL_TABLET_MIN_WIDTH,
} from "@/shared/lib/screenBreakpoints";
import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";

export const CATALOG_BROWSER_GRID_GAP = resolveCatalogProductGridGapPx(
  CATALOG_PRODUCT_GRID_NARROW_BREAKPOINT_PX,
);
export const CATALOG_BROWSER_PAGE_PADDING = SCREEN_CONTENT_PADDING_HORIZONTAL;
export const CATALOG_BROWSER_GRID_NARROW_MAX_WIDTH = SCREEN_NARROW_MAX_WIDTH;
export const CATALOG_BROWSER_GRID_TABLET_MIN_WIDTH = SCREEN_SMALL_TABLET_MIN_WIDTH;
export const CATALOG_BROWSER_GRID_MEDIUM_TABLET_MIN_WIDTH = SCREEN_MEDIUM_TABLET_MIN_WIDTH;
export const CATALOG_BROWSER_GRID_LARGE_TABLET_MIN_WIDTH = SCREEN_LARGE_TABLET_MIN_WIDTH;
export const CATALOG_BROWSER_GRID_3_COL_MIN_WIDTH =
  CATALOG_PRODUCT_GRID_NARROW_BREAKPOINT_PX + 1;
export const CATALOG_BROWSER_GRID_4_COL_MIN_WIDTH =
  CATALOG_PRODUCT_GRID_COLUMN_BREAKPOINT_PX + 1;
export const CATALOG_BROWSER_GRID_COLUMNS_NARROW = CATALOG_PRODUCT_GRID_MIN_COLUMNS;
export const CATALOG_BROWSER_GRID_COLUMNS_DEFAULT = CATALOG_PRODUCT_GRID_MOBILE_COLUMNS;
export const CATALOG_BROWSER_GRID_COLUMNS_TABLET = CATALOG_PRODUCT_GRID_MOBILE_COLUMNS;
export const CATALOG_BROWSER_GRID_COLUMNS_MEDIUM_TABLET = CATALOG_PRODUCT_GRID_MOBILE_COLUMNS;
export const CATALOG_BROWSER_GRID_COLUMNS_LARGE_TABLET = CATALOG_PRODUCT_GRID_MOBILE_COLUMNS;

/** @deprecated используйте resolveCatalogBrowserGridColumns */
export const CATALOG_BROWSER_GRID_COLUMNS = CATALOG_BROWSER_GRID_COLUMNS_DEFAULT;

export const resolveCatalogBrowserGridColumns = (screenWidth: number) =>
  resolveCatalogProductGridColumns(screenWidth);

export const resolveCatalogBrowserGridGap = (screenWidth: number) =>
  resolveCatalogProductGridGapPx(screenWidth);

export const catalogBrowserProductGridResolvers = {
  resolveColumns: ({ width }: { width: number; height: number }) =>
    resolveCatalogBrowserGridColumns(width),
  resolveGap: resolveCatalogBrowserGridGap,
};
