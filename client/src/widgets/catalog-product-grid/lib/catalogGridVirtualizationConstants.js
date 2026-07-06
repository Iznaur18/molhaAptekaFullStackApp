/** Включать виртуализацию, если товаров в списке больше этого числа. */
export const CATALOG_VIRTUALIZATION_MIN_ITEM_COUNT = 101;

/** Стартовая высота строки сетки (px), уточняется после измерения DOM. */
export const CATALOG_VIRTUAL_ROW_HEIGHT_PX = 520;

/** Дополнительные строки сверху/снизу видимой области. */
export const CATALOG_VIRTUAL_OVERSCAN_ROWS = 2;

/** Совпадает с `@container app-viewport (max-width: 903px)` в `app/ui/AppShell.css`. */
export const CATALOG_GRID_COLUMN_BREAKPOINT_PX = 903;

export const CATALOG_GRID_MOBILE_COLUMNS = 3;

/** Совпадает с `@container app-viewport (max-width: 667px)` в `app/ui/AppShell.css`. */
export const CATALOG_GRID_NARROW_MOBILE_BREAKPOINT_PX = 667;

export const CATALOG_GRID_NARROW_MOBILE_COLUMNS = 2;

export const CATALOG_GRID_MIN_COLUMN_PX = 280;

export const CATALOG_GRID_GAP_PX = 16;
