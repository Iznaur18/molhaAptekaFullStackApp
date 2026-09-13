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
 * Колонки по ширине viewport (как mobile), не по сжатому `.app-shell`.
 *
 * @param {import('react').RefObject<HTMLElement | null>} _containerRef
 * @param {boolean} enabled
 * @returns {number}
 */
export function useCatalogGridColumnCount(_containerRef, enabled) {
  // Сразу верное число колонок: с 1 на первом рендере лента блоками
  // пересобрала бы блоки и перемонтировала все карточки сразу после старта.
  const [columnCount, setColumnCount] = useState(() =>
    typeof document === "undefined"
      ? 1
      : getCatalogGridColumnCount(document.documentElement.clientWidth),
  );

  useLayoutEffect(() => {
    if (!enabled || typeof document === "undefined") {
      return undefined;
    }

    const viewportEl = document.documentElement;
    let frameId = /** @type {number | null} */ (null);

    const scheduleUpdate = () => {
      if (frameId != null) {
        cancelAnimationFrame(frameId);
      }
      frameId = requestAnimationFrame(() => {
        frameId = null;
        applyCatalogGridColumnCount(viewportEl.clientWidth, setColumnCount);
      });
    };

    // Синхронно до первой отрисовки: иначе первый кадр раскладывается с
    // columnCount = 1, а после замера баннеры перепрыгивают на другие ряды (CLS).
    applyCatalogGridColumnCount(viewportEl.clientWidth, setColumnCount);
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(viewportEl);

    return () => {
      observer.disconnect();
      if (frameId != null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [enabled]);

  return columnCount;
}
