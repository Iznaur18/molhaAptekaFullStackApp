import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";

export const CATALOG_BROWSER_GRID_GAP = 6;
export const CATALOG_BROWSER_PAGE_PADDING = SCREEN_CONTENT_PADDING_HORIZONTAL;
/** < 360dp — узкие телефоны (Samsung A-серия и т.п.) */
export const CATALOG_BROWSER_GRID_NARROW_MAX_WIDTH = 359;

/** ≥ 600dp — планшеты и широкие окна Expo web */
export const CATALOG_BROWSER_GRID_TABLET_MIN_WIDTH = 600;

export const CATALOG_BROWSER_GRID_COLUMNS_NARROW = 2;
export const CATALOG_BROWSER_GRID_COLUMNS_DEFAULT = 3;
export const CATALOG_BROWSER_GRID_COLUMNS_TABLET = 4;

/** @deprecated используйте resolveCatalogBrowserGridColumns */
export const CATALOG_BROWSER_GRID_COLUMNS = CATALOG_BROWSER_GRID_COLUMNS_DEFAULT;

export const resolveCatalogBrowserGridColumns = (screenWidth: number): number => {
  if (screenWidth <= CATALOG_BROWSER_GRID_NARROW_MAX_WIDTH) {
    return CATALOG_BROWSER_GRID_COLUMNS_NARROW;
  }
  if (screenWidth >= CATALOG_BROWSER_GRID_TABLET_MIN_WIDTH) {
    return CATALOG_BROWSER_GRID_COLUMNS_TABLET;
  }
  return CATALOG_BROWSER_GRID_COLUMNS_DEFAULT;
};
