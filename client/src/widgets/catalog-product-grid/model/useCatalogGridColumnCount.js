import { useLayoutEffect, useState } from "react";

import { getCatalogGridColumnCount } from "../lib/getCatalogGridColumnCount.js";

/**
 * @param {number} width
 * @param {(next: number) => void} setColumnCount
 */
function applyCatalogGridColumnCount(width, setColumnCount) {
  setColumnCount((prev) => {
    const next = getCatalogGridColumnCount(width);
    return prev === next ? prev : next;
  });
}

/**
 * @param {import('react').RefObject<HTMLElement | null>} containerRef
 * @param {boolean} enabled
 * @returns {number}
 */
export function useCatalogGridColumnCount(containerRef, enabled) {
  const [columnCount, setColumnCount] = useState(1);

  useLayoutEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const element = containerRef.current;
    if (!element) {
      return undefined;
    }

    let frameId = /** @type {number | null} */ (null);

    const scheduleUpdate = () => {
      if (frameId != null) {
        cancelAnimationFrame(frameId);
      }
      frameId = requestAnimationFrame(() => {
        frameId = null;
        if (!containerRef.current) {
          return;
        }
        applyCatalogGridColumnCount(containerRef.current.clientWidth, setColumnCount);
      });
    };

    // Синхронно до первой отрисовки: иначе первый кадр раскладывается с
    // columnCount = 1, а после замера баннеры перепрыгивают на другие ряды (CLS).
    applyCatalogGridColumnCount(element.clientWidth, setColumnCount);
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(element);

    return () => {
      observer.disconnect();
      if (frameId != null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [containerRef, enabled]);

  return columnCount;
}
