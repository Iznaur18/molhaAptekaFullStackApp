/** Включать виртуализацию, если товаров в списке больше этого числа. */
export const CATALOG_VIRTUALIZATION_MIN_ITEM_COUNT = 101;

/** Стартовая высота строки сетки (px), уточняется после измерения DOM. */
export const CATALOG_VIRTUAL_ROW_HEIGHT_PX = 520;

/** Дополнительные строки сверху/снизу видимой области. */
export const CATALOG_VIRTUAL_OVERSCAN_ROWS = 2;

/** Mobile: `@container app-viewport (max-width: 640px)` → 3 колонки. */
export const CATALOG_GRID_MOBILE_BREAKPOINT_PX = 640;

export const CATALOG_GRID_MOBILE_COLUMNS = 3;

/** Tablet: `@container app-viewport (max-width: 1023px)` → 4 колонки. */
export const CATALOG_GRID_TABLET_BREAKPOINT_PX = 1023;

export const CATALOG_GRID_TABLET_COLUMNS = 4;

/** Desktop auto-fill min column (marketplace density). */
export const CATALOG_GRID_MIN_COLUMN_PX = 200;

export const CATALOG_GRID_GAP_PX = 16;

/** @deprecated alias — prefer CATALOG_GRID_MOBILE_BREAKPOINT_PX */
export const CATALOG_GRID_COLUMN_BREAKPOINT_PX = CATALOG_GRID_MOBILE_BREAKPOINT_PX;

/** @deprecated alias — narrow gap band, not column switch */
export const CATALOG_GRID_NARROW_MOBILE_BREAKPOINT_PX = 667;
