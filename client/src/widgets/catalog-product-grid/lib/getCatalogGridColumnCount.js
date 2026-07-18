import {
  CATALOG_GRID_GAP_PX,
  CATALOG_GRID_MIN_COLUMN_PX,
  CATALOG_GRID_MOBILE_BREAKPOINT_PX,
  CATALOG_GRID_MOBILE_COLUMNS,
  CATALOG_GRID_TABLET_BREAKPOINT_PX,
  CATALOG_GRID_TABLET_COLUMNS,
} from "./catalogGridVirtualizationConstants.js";

/**
 * Число колонок сетки каталога (паритет с `AppShell.css`).
 * ≤640 → 3 · ≤1023 → 4 · desktop → auto-fill по minmax(200px).
 *
 * @param {number} containerWidth
 * @returns {number}
 */
export function getCatalogGridColumnCount(containerWidth) {
  if (!Number.isFinite(containerWidth) || containerWidth <= 0) {
    return 1;
  }

  if (containerWidth <= CATALOG_GRID_MOBILE_BREAKPOINT_PX) {
    return CATALOG_GRID_MOBILE_COLUMNS;
  }

  if (containerWidth <= CATALOG_GRID_TABLET_BREAKPOINT_PX) {
    return CATALOG_GRID_TABLET_COLUMNS;
  }

  return Math.max(
    CATALOG_GRID_TABLET_COLUMNS,
    Math.floor(
      (containerWidth + CATALOG_GRID_GAP_PX) /
        (CATALOG_GRID_MIN_COLUMN_PX + CATALOG_GRID_GAP_PX),
    ),
  );
}
