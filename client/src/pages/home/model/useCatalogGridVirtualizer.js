import { useCallback, useEffect, useLayoutEffect, useState } from "react";

import {
  CATALOG_VIRTUAL_OVERSCAN_ROWS,
  CATALOG_VIRTUAL_ROW_HEIGHT_PX,
} from "../lib/catalogGridVirtualizationConstants.js";

/**
 * Виртуализация строк CSS-grid каталога при прокрутке окна.
 *
 * @param {{
 *   enabled: boolean;
 *   hostRef: import('react').RefObject<HTMLElement | null>;
 *   gridRef: import('react').RefObject<HTMLElement | null>;
 *   itemCount: number;
 *   columnCount: number;
 * }} params
 */
export function useCatalogGridVirtualizer({
  enabled,
  hostRef,
  gridRef,
  itemCount,
  columnCount,
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [hostTop, setHostTop] = useState(0);
  const [rowHeight, setRowHeight] = useState(CATALOG_VIRTUAL_ROW_HEIGHT_PX);

  const updateHostTop = useCallback(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }
    const rect = host.getBoundingClientRect();
    setHostTop(rect.top + window.scrollY);
  }, [hostRef]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const onScroll = () => {
      setScrollTop(window.scrollY);
    };
    const onResize = () => {
      setViewportHeight(window.innerHeight);
      updateHostTop();
    };

    onResize();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled, updateHostTop]);

  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }
    updateHostTop();
  }, [enabled, itemCount, columnCount, updateHostTop]);

  useLayoutEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const grid = gridRef.current;
    if (!grid || itemCount === 0 || columnCount < 1) {
      return undefined;
    }

    const visibleRows = Math.max(1, Math.ceil(grid.childElementCount / columnCount));
    const measured = Math.ceil(grid.getBoundingClientRect().height / visibleRows);
    if (measured < 200) {
      return undefined;
    }

    setRowHeight((prev) => (Math.abs(prev - measured) > 12 ? measured : prev));
  }, [columnCount, enabled, gridRef, itemCount, scrollTop]);

  if (!enabled || itemCount === 0 || columnCount < 1) {
    return {
      startIndex: 0,
      endIndex: Math.max(0, itemCount - 1),
      offsetTop: 0,
      totalHeight: 0,
      rowHeight: CATALOG_VIRTUAL_ROW_HEIGHT_PX,
    };
  }

  const rowCount = Math.ceil(itemCount / columnCount);
  const totalHeight = rowCount * rowHeight;
  const viewportTop = Math.max(0, scrollTop - hostTop);
  const viewportBottom = viewportTop + viewportHeight;

  const startRow = Math.max(
    0,
    Math.floor(viewportTop / rowHeight) - CATALOG_VIRTUAL_OVERSCAN_ROWS,
  );
  const endRow = Math.min(
    rowCount - 1,
    Math.ceil(viewportBottom / rowHeight) + CATALOG_VIRTUAL_OVERSCAN_ROWS,
  );

  const startIndex = startRow * columnCount;
  const endIndex = Math.min(itemCount - 1, (endRow + 1) * columnCount - 1);

  return {
    startIndex,
    endIndex,
    offsetTop: startRow * rowHeight,
    totalHeight,
    rowHeight,
  };
}
