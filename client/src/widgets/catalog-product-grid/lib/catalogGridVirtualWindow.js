import {
  CATALOG_VIRTUAL_OVERSCAN_ROWS,
  CATALOG_VIRTUAL_ROW_HEIGHT_PX,
} from "../lib/catalogGridVirtualizationConstants.js";

/**
 * @param {{
 *   itemCount: number;
 *   columnCount: number;
 *   rowHeight: number;
 *   scrollTop: number;
 *   hostTop: number;
 *   viewportHeight: number;
 *   overscanRows?: number;
 * }} params
 */
export function computeCatalogVirtualWindow({
  itemCount,
  columnCount,
  rowHeight,
  scrollTop,
  hostTop,
  viewportHeight,
  overscanRows = CATALOG_VIRTUAL_OVERSCAN_ROWS,
}) {
  if (itemCount === 0 || columnCount < 1) {
    return {
      startIndex: 0,
      endIndex: Math.max(0, itemCount - 1),
      offsetTop: 0,
      totalHeight: 0,
      rowHeight: CATALOG_VIRTUAL_ROW_HEIGHT_PX,
    };
  }

  const safeRowHeight = Math.max(rowHeight, 1);
  const rowCount = Math.ceil(itemCount / columnCount);
  const totalHeight = rowCount * safeRowHeight;
  const viewportTop = Math.max(0, scrollTop - hostTop);
  const viewportBottom = viewportTop + Math.max(viewportHeight, 0);

  const startRow = Math.max(0, Math.floor(viewportTop / safeRowHeight) - overscanRows);
  const endRow = Math.min(
    rowCount - 1,
    Math.ceil(viewportBottom / safeRowHeight) + overscanRows,
  );

  const startIndex = startRow * columnCount;
  const endIndex = Math.min(itemCount - 1, (endRow + 1) * columnCount - 1);

  return {
    startIndex,
    endIndex,
    offsetTop: startRow * safeRowHeight,
    totalHeight,
    rowHeight: safeRowHeight,
  };
}

/**
 * @param {HTMLElement} grid
 * @param {number} columnCount
 * @param {number} minHeightPx
 */
export function measureCatalogGridRowHeight(grid, columnCount, minHeightPx) {
  const sampleCount = Math.min(columnCount, grid.children.length);
  if (sampleCount === 0) {
    return null;
  }

  let maxHeight = 0;
  for (let index = 0; index < sampleCount; index += 1) {
    const child = grid.children.item(index);
    if (!child) continue;
    maxHeight = Math.max(maxHeight, child.getBoundingClientRect().height);
  }

  if (maxHeight < minHeightPx) {
    return null;
  }

  return maxHeight;
}

/**
 * @returns {number}
 */
export function getCatalogScrollTop() {
  if (typeof window === "undefined") {
    return 0;
  }

  const visualViewport = window.visualViewport;
  if (visualViewport && typeof visualViewport.pageTop === "number") {
    return visualViewport.pageTop;
  }

  return window.scrollY;
}

/**
 * @returns {number}
 */
export function getCatalogViewportHeight() {
  if (typeof window === "undefined") {
    return 0;
  }

  if (typeof window.visualViewport?.height === "number") {
    return window.visualViewport.height;
  }

  return window.innerHeight;
}

/**
 * @param {HTMLElement} host
 * @returns {number}
 */
export function getCatalogHostTop(host) {
  const rect = host.getBoundingClientRect();
  const pageTop =
    typeof window.visualViewport?.pageTop === "number"
      ? window.visualViewport.pageTop
      : window.scrollY;
  return rect.top + pageTop;
}
