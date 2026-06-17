import {
  CATALOG_GRID_COLUMN_BREAKPOINT_PX,
  CATALOG_GRID_GAP_PX,
  CATALOG_GRID_MIN_COLUMN_PX,
  CATALOG_GRID_MOBILE_COLUMNS,
  CATALOG_GRID_NARROW_MOBILE_BREAKPOINT_PX,
  CATALOG_GRID_NARROW_MOBILE_COLUMNS,
} from "./catalogGridVirtualizationConstants.js";

/**
 * Число колонок для `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`,
 * 3 колонок на планшетах и 2 — на узком мобильном.
 *
 * @param {number} containerWidth
 * @returns {number}
 */
export function getCatalogGridColumnCount(containerWidth) {
  if (!Number.isFinite(containerWidth) || containerWidth <= 0) {
    return 1;
  }

  if (containerWidth <= CATALOG_GRID_NARROW_MOBILE_BREAKPOINT_PX) {
    return CATALOG_GRID_NARROW_MOBILE_COLUMNS;
  }

  if (containerWidth <= CATALOG_GRID_COLUMN_BREAKPOINT_PX) {
    return CATALOG_GRID_MOBILE_COLUMNS;
  }

  return Math.max(
    1,
    Math.floor(
      (containerWidth + CATALOG_GRID_GAP_PX) /
        (CATALOG_GRID_MIN_COLUMN_PX + CATALOG_GRID_GAP_PX),
    ),
  );
}
