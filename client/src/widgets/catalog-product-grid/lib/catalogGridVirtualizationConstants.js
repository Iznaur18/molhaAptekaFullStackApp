/** Включать виртуализацию, если товаров в списке больше этого числа. */
export const CATALOG_VIRTUALIZATION_MIN_ITEM_COUNT = 101;

/** Стартовая высота строки сетки (px), уточняется после измерения DOM. */
export const CATALOG_VIRTUAL_ROW_HEIGHT_PX = 520;

/** Дополнительные строки сверху/снизу видимой области. */
export const CATALOG_VIRTUAL_OVERSCAN_ROWS = 2;

/**
 * Паритет с mobile `resolveProductGridColumns` / `screenBreakpoints.ts`.
 * ≤667 → 2 · ≤903 / <1280 → 3 · ≥1280 → 4.
 */
export const CATALOG_GRID_2_COL_MAX_PX = 667;
export const CATALOG_GRID_3_COL_MAX_PX = 903;
export const CATALOG_GRID_4_COL_MIN_PX = 1280;

export const CATALOG_GRID_COLUMNS_COMPACT = 2;
export const CATALOG_GRID_COLUMNS_MEDIUM = 3;
export const CATALOG_GRID_COLUMNS_WIDE = 4;

/** @deprecated alias — compact (2 col) band */
export const CATALOG_GRID_MOBILE_BREAKPOINT_PX = CATALOG_GRID_2_COL_MAX_PX;

/** @deprecated alias */
export const CATALOG_GRID_MOBILE_COLUMNS = CATALOG_GRID_COLUMNS_COMPACT;

/** @deprecated alias — medium (3 col) upper before wide */
export const CATALOG_GRID_TABLET_BREAKPOINT_PX = CATALOG_GRID_4_COL_MIN_PX - 1;

/** @deprecated alias */
export const CATALOG_GRID_TABLET_COLUMNS = CATALOG_GRID_COLUMNS_MEDIUM;

/** Desktop min column (legacy auto-fill). */
export const CATALOG_GRID_MIN_COLUMN_PX = 200;

export const CATALOG_GRID_GAP_PX = 16;

/** @deprecated alias — prefer CATALOG_GRID_MOBILE_BREAKPOINT_PX */
export const CATALOG_GRID_COLUMN_BREAKPOINT_PX = CATALOG_GRID_MOBILE_BREAKPOINT_PX;

/** @deprecated alias — narrow gap band, not column switch */
export const CATALOG_GRID_NARROW_MOBILE_BREAKPOINT_PX = CATALOG_GRID_2_COL_MAX_PX;
