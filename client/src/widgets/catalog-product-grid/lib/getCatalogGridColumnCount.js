import {
  CATALOG_GRID_2_COL_MAX_PX,
  CATALOG_GRID_3_COL_MAX_PX,
  CATALOG_GRID_4_COL_MIN_PX,
  CATALOG_GRID_COLUMNS_COMPACT,
  CATALOG_GRID_COLUMNS_MEDIUM,
  CATALOG_GRID_COLUMNS_WIDE,
} from "./catalogGridVirtualizationConstants.js";

/**
 * Число колонок сетки каталога (паритет с mobile `resolveProductGridColumns`).
 * Ширина — viewport (`documentElement` / окно), не ширина уже сжатой колонки.
 *
 * @param {number} viewportWidth
 * @returns {number}
 */
export function getCatalogGridColumnCount(viewportWidth) {
  if (!Number.isFinite(viewportWidth) || viewportWidth <= 0) {
    return 1;
  }

  if (viewportWidth <= CATALOG_GRID_2_COL_MAX_PX) {
    return CATALOG_GRID_COLUMNS_COMPACT;
  }

  if (viewportWidth <= CATALOG_GRID_3_COL_MAX_PX) {
    return CATALOG_GRID_COLUMNS_MEDIUM;
  }

  if (viewportWidth < CATALOG_GRID_4_COL_MIN_PX) {
    return CATALOG_GRID_COLUMNS_MEDIUM;
  }

  return CATALOG_GRID_COLUMNS_WIDE;
}
