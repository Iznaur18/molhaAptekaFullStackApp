import { useEffect, useLayoutEffect, useState } from "react";

import { getCatalogGridColumnCount } from "../lib/getCatalogGridColumnCount.js";

/**
 * @param {import('react').RefObject<HTMLElement | null>} containerRef
 * @param {boolean} enabled
 * @returns {number}
 */
export function useCatalogGridColumnCount(containerRef, enabled) {
  const [columnCount, setColumnCount] = useState(1);

  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }
    const element = containerRef.current;
    if (!element) {
      return;
    }
    setColumnCount(getCatalogGridColumnCount(element.clientWidth));
  }, [containerRef, enabled]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const element = containerRef.current;
    if (!element) {
      return undefined;
    }

    const update = () => {
      setColumnCount(getCatalogGridColumnCount(element.clientWidth));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [containerRef, enabled]);

  return columnCount;
}
