/** Паритет с `client/.../catalogGridVirtualizationConstants.js` + `AppShell.css`. */
export const CATALOG_PRODUCT_GRID_REM_BASE_PX = 16;

/** `@media (max-width: 903px)` */
export const CATALOG_PRODUCT_GRID_COLUMN_BREAKPOINT_PX = 903;

/** `@media (max-width: 667px)` */
export const CATALOG_PRODUCT_GRID_NARROW_BREAKPOINT_PX = 667;

export const CATALOG_PRODUCT_GRID_MOBILE_COLUMNS = 3;
/** Минимум колонок в mobile app — всегда 3 (как web @903px на любом viewport). */
export const CATALOG_PRODUCT_GRID_MIN_COLUMNS = CATALOG_PRODUCT_GRID_MOBILE_COLUMNS;
export const CATALOG_PRODUCT_GRID_MIN_COLUMN_PX = 280;
export const CATALOG_PRODUCT_GRID_GAP_DESKTOP_PX = 16;

export const resolveCatalogProductGridGapPx = (viewportWidth: number): number => {
  if (viewportWidth <= CATALOG_PRODUCT_GRID_NARROW_BREAKPOINT_PX) {
    return CATALOG_PRODUCT_GRID_REM_BASE_PX * 0.1;
  }
  if (viewportWidth <= CATALOG_PRODUCT_GRID_COLUMN_BREAKPOINT_PX) {
    return CATALOG_PRODUCT_GRID_REM_BASE_PX * 0.15;
  }
  return CATALOG_PRODUCT_GRID_GAP_DESKTOP_PX;
};

export const resolveCatalogProductGridColumns = (viewportWidth: number): number => {
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
