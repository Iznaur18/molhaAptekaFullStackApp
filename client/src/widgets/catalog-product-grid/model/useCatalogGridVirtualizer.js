import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { CATALOG_VIRTUAL_ROW_HEIGHT_PX } from "../lib/catalogGridVirtualizationConstants.js";
import {
  computeCatalogVirtualWindow,
  getCatalogHostTop,
  getCatalogScrollTop,
  getCatalogViewportHeight,
  measureCatalogGridRowHeight,
} from "../lib/catalogGridVirtualWindow.js";

const ROW_HEIGHT_MEASURE_THRESHOLD_PX = 12;
const ROW_HEIGHT_MIN_PX = 200;

const EMPTY_VIRTUAL_WINDOW = computeCatalogVirtualWindow({
  itemCount: 0,
  columnCount: 1,
  rowHeight: CATALOG_VIRTUAL_ROW_HEIGHT_PX,
  scrollTop: 0,
  hostTop: 0,
  viewportHeight: 0,
});

/**
 * @param {ReturnType<typeof computeCatalogVirtualWindow>} a
 * @param {ReturnType<typeof computeCatalogVirtualWindow>} b
 */
function isSameVirtualWindow(a, b) {
  return (
    a.startIndex === b.startIndex &&
    a.endIndex === b.endIndex &&
    a.offsetTop === b.offsetTop &&
    a.totalHeight === b.totalHeight &&
    a.rowHeight === b.rowHeight
  );
}

/**
 * Виртуализация строк CSS-grid каталога при прокрутке окна.
 *
 * Метрики прокрутки (scrollTop, hostTop, высота viewport) и высота строки
 * живут в ref; в state попадает только само окно — видимые строки, сдвиг,
 * полная высота — и только когда оно изменилось. Раньше метрики были state и
 * обновлялись на каждом кадре прокрутки: сетка со всеми видимыми карточками
 * перерисовывалась ~60 раз в секунду, хотя набор строк меняется раз на
 * ~300 px, и на iPhone лента подтормаживала (13.09.2026).
 *
 * Оценка высоты строки сбрасывается только при смене числа колонок. Сброс на
 * каждую догруженную страницу давал скачки полной высоты ленты, а на iOS они
 * прижимают прокрутку к концу страницы.
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
  const [virtualWindow, setVirtualWindow] = useState(EMPTY_VIRTUAL_WINDOW);
  // Зеркало последнего окна в state: сравниваем ДО setState. Updater, который
  // возвращает прежнее значение, не всегда спасает — React может ещё раз
  // вызвать компонент, прежде чем отбросить обновление.
  const virtualWindowRef = useRef(EMPTY_VIRTUAL_WINDOW);
  const metricsRef = useRef({ scrollTop: 0, viewportHeight: 0, hostTop: 0 });
  const rowHeightRef = useRef(CATALOG_VIRTUAL_ROW_HEIGHT_PX);
  const gridInputsRef = useRef({ itemCount, columnCount });
  const lastColumnCountRef = useRef(columnCount);
  const metricsFrameRef = useRef(/** @type {number | null} */ (null));
  const measureFrameRef = useRef(/** @type {number | null} */ (null));

  const commitVirtualWindow = useCallback(() => {
    const { itemCount: count, columnCount: columns } = gridInputsRef.current;
    const next = computeCatalogVirtualWindow({
      itemCount: count,
      columnCount: columns,
      rowHeight: rowHeightRef.current,
      scrollTop: metricsRef.current.scrollTop,
      hostTop: metricsRef.current.hostTop,
      viewportHeight: metricsRef.current.viewportHeight,
    });
    if (isSameVirtualWindow(virtualWindowRef.current, next)) {
      return;
    }
    virtualWindowRef.current = next;
    setVirtualWindow(next);
  }, []);

  const updateViewportMetrics = useCallback(() => {
    const host = hostRef.current;
    metricsRef.current = {
      scrollTop: getCatalogScrollTop(),
      viewportHeight: getCatalogViewportHeight(),
      hostTop: host ? getCatalogHostTop(host) : metricsRef.current.hostTop,
    };
    commitVirtualWindow();
  }, [commitVirtualWindow, hostRef]);

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
      window.visualViewport?.removeEventListener(
        "resize",
        scheduleViewportMetricsUpdate,
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        scheduleViewportMetricsUpdate,
      );
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

  // До отрисовки: новое окно должно быть готово в том же кадре, что и новые
  // товары/колонки, иначе мелькнёт пустая или обрезанная лента.
  useLayoutEffect(() => {
    if (!enabled) {
      return undefined;
    }
    if (lastColumnCountRef.current !== columnCount) {
      lastColumnCountRef.current = columnCount;
      rowHeightRef.current = CATALOG_VIRTUAL_ROW_HEIGHT_PX;
    }
    gridInputsRef.current = { itemCount, columnCount };
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

    const measureGridRow = () => {
      const measured = measureCatalogGridRowHeight(
        grid,
        columnCount,
        ROW_HEIGHT_MIN_PX,
      );
      if (
        measured != null &&
        Math.abs(rowHeightRef.current - measured) > ROW_HEIGHT_MEASURE_THRESHOLD_PX
      ) {
        rowHeightRef.current = measured;
        commitVirtualWindow();
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

    for (
      let index = 0;
      index < Math.min(columnCount, grid.children.length);
      index += 1
    ) {
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
  }, [columnCount, commitVirtualWindow, enabled, gridRef, itemCount]);

  return enabled ? virtualWindow : EMPTY_VIRTUAL_WINDOW;
}
