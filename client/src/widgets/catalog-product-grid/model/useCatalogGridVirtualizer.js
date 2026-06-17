import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  CATALOG_VIRTUAL_ROW_HEIGHT_PX,
} from "../lib/catalogGridVirtualizationConstants.js";
import {
  computeCatalogVirtualWindow,
  getCatalogHostTop,
  getCatalogScrollTop,
  getCatalogViewportHeight,
  measureCatalogGridRowHeight,
} from "../lib/catalogGridVirtualWindow.js";

const ROW_HEIGHT_MEASURE_THRESHOLD_PX = 12;
const ROW_HEIGHT_MIN_PX = 200;

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
  const metricsFrameRef = useRef(/** @type {number | null} */ (null));
  const measureFrameRef = useRef(/** @type {number | null} */ (null));

  const updateViewportMetrics = useCallback(() => {
    const host = hostRef.current;
    setScrollTop(getCatalogScrollTop());
    setViewportHeight(getCatalogViewportHeight());
    if (host) {
      setHostTop(getCatalogHostTop(host));
    }
  }, [hostRef]);

  const scheduleViewportMetricsUpdate = useCallback(() => {
    if (metricsFrameRef.current != null) {
      cancelAnimationFrame(metricsFrameRef.current);
    }
    metricsFrameRef.current = requestAnimationFrame(() => {
      metricsFrameRef.current = null;
      updateViewportMetrics();
    });
  }, [updateViewportMetrics]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    updateViewportMetrics();

    const onScroll = () => {
      scheduleViewportMetricsUpdate();
    };

    let scrollEndTimer = /** @type {ReturnType<typeof setTimeout> | undefined} */ (
      undefined
    );
    const onScrollWithEndSync = () => {
      scheduleViewportMetricsUpdate();
      if (scrollEndTimer != null) {
        clearTimeout(scrollEndTimer);
      }
      scrollEndTimer = setTimeout(() => {
        scrollEndTimer = undefined;
        updateViewportMetrics();
      }, 150);
    };

    window.addEventListener("scroll", onScrollWithEndSync, { passive: true });
    window.addEventListener("resize", scheduleViewportMetricsUpdate);
    window.addEventListener("orientationchange", scheduleViewportMetricsUpdate);
    window.visualViewport?.addEventListener("resize", scheduleViewportMetricsUpdate);
    window.visualViewport?.addEventListener("scroll", scheduleViewportMetricsUpdate);

    return () => {
      window.removeEventListener("scroll", onScrollWithEndSync);
      window.removeEventListener("resize", scheduleViewportMetricsUpdate);
      window.removeEventListener("orientationchange", scheduleViewportMetricsUpdate);
      window.visualViewport?.removeEventListener("resize", scheduleViewportMetricsUpdate);
      window.visualViewport?.removeEventListener("scroll", scheduleViewportMetricsUpdate);
      if (scrollEndTimer != null) {
        clearTimeout(scrollEndTimer);
      }
      if (metricsFrameRef.current != null) {
        cancelAnimationFrame(metricsFrameRef.current);
        metricsFrameRef.current = null;
      }
    };
  }, [enabled, scheduleViewportMetricsUpdate, updateViewportMetrics]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const host = hostRef.current;
    if (!host || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      scheduleViewportMetricsUpdate();
    });
    observer.observe(host);
    return () => {
      observer.disconnect();
    };
  }, [enabled, hostRef, scheduleViewportMetricsUpdate]);

  useLayoutEffect(() => {
    if (!enabled) {
      return undefined;
    }
    setRowHeight(CATALOG_VIRTUAL_ROW_HEIGHT_PX);
    updateViewportMetrics();
    return undefined;
  }, [columnCount, enabled, itemCount, updateViewportMetrics]);

  useLayoutEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const grid = gridRef.current;
    if (!grid || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const applyMeasuredHeight = (measured) => {
      setRowHeight((prev) =>
        Math.abs(prev - measured) > ROW_HEIGHT_MEASURE_THRESHOLD_PX ? measured : prev,
      );
    };

    const measureGridRow = () => {
      const measured = measureCatalogGridRowHeight(grid, columnCount, ROW_HEIGHT_MIN_PX);
      if (measured != null) {
        applyMeasuredHeight(measured);
      }
    };

    measureGridRow();

    const observer = new ResizeObserver(() => {
      if (measureFrameRef.current != null) {
        cancelAnimationFrame(measureFrameRef.current);
      }
      measureFrameRef.current = requestAnimationFrame(() => {
        measureFrameRef.current = null;
        measureGridRow();
      });
    });

    for (let index = 0; index < Math.min(columnCount, grid.children.length); index += 1) {
      const child = grid.children.item(index);
      if (child) {
        observer.observe(child);
      }
    }

    return () => {
      observer.disconnect();
      if (measureFrameRef.current != null) {
        cancelAnimationFrame(measureFrameRef.current);
        measureFrameRef.current = null;
      }
    };
  }, [columnCount, enabled, gridRef, itemCount]);

  if (!enabled) {
    return computeCatalogVirtualWindow({
      itemCount: 0,
      columnCount: Math.max(columnCount, 1),
      rowHeight: CATALOG_VIRTUAL_ROW_HEIGHT_PX,
      scrollTop: 0,
      hostTop: 0,
      viewportHeight: 0,
    });
  }

  return computeCatalogVirtualWindow({
    itemCount,
    columnCount,
    rowHeight,
    scrollTop,
    hostTop,
    viewportHeight,
  });
}
