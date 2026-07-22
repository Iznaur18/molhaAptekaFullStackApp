import { useEffect, useRef } from "react";

const DEFAULT_MIN_SWIPE_DISTANCE_PX = 72;
const VERTICAL_DRIFT_RATIO = 1.25;
const SCROLL_DRIFT_TOLERANCE_PX = 12;
const INTERACTIVE_SELECTOR =
  "input, textarea, select, button, a, label, [contenteditable='true']";
/** Горизонтальный pager/галерея — свайп вправо листает фото, не закрывает экран. */
const HORIZONTAL_SWIPE_IGNORE_SELECTOR =
  ".product-media-horizontal-pager, .product-media-gallery-readonly, .product-media-gallery-readonly__hero";

/**
 * @param {import("react").RefObject<HTMLElement | null>} containerRef
 * @param {{
 *   enabled?: boolean;
 *   onDismiss: () => void;
 *   minSwipeDistancePx?: number;
 * }} options
 */
export function useSwipeRightToDismiss(
  containerRef,
  { enabled = true, onDismiss, minSwipeDistancePx = DEFAULT_MIN_SWIPE_DISTANCE_PX },
) {
  const touchStartRef = useRef(null);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!enabled) {
      touchStartRef.current = null;
      return undefined;
    }

    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const resetTouchStart = () => {
      touchStartRef.current = null;
    };

    const onTouchStart = (event) => {
      if (event.touches.length !== 1) {
        resetTouchStart();
        return;
      }

      const target = /** @type {Element | null} */ (event.target);
      if (target?.closest(INTERACTIVE_SELECTOR)) {
        resetTouchStart();
        return;
      }
      if (target?.closest(HORIZONTAL_SWIPE_IGNORE_SELECTOR)) {
        resetTouchStart();
        return;
      }

      const touch = event.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        scrollTop: container.scrollTop,
      };
    };

    const onTouchMove = (event) => {
      const touchStart = touchStartRef.current;
      if (!touchStart || event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;

      if (deltaX < 0 || Math.abs(deltaY) > Math.abs(deltaX)) {
        resetTouchStart();
      }
    };

    const onTouchEnd = (event) => {
      const touchStart = touchStartRef.current;
      touchStartRef.current = null;

      if (!touchStart || event.changedTouches.length !== 1) {
        return;
      }

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;

      if (deltaX < minSwipeDistancePx) {
        return;
      }

      if (Math.abs(deltaX) < Math.abs(deltaY) * VERTICAL_DRIFT_RATIO) {
        return;
      }

      if (
        Math.abs(container.scrollTop - touchStart.scrollTop) > SCROLL_DRIFT_TOLERANCE_PX
      ) {
        return;
      }

      onDismissRef.current();
    };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: true });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    container.addEventListener("touchcancel", resetTouchStart, { passive: true });

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("touchcancel", resetTouchStart);
      resetTouchStart();
    };
  }, [containerRef, enabled, minSwipeDistancePx]);
}
