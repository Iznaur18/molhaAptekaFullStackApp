import { useCallback, useEffect, useRef } from "react";

const DEFAULT_MIN_SWIPE_DISTANCE_PX = 48;
const HORIZONTAL_DOMINANCE_RATIO = 1.25;
const INTERACTIVE_SELECTOR =
  "button, a, input, textarea, select, label, [contenteditable='true']";

/**
 * @param {{
 *   deltaX: number;
 *   deltaY: number;
 *   minSwipeDistancePx: number;
 * }} params
 */
function shouldNavigateHorizontal({ deltaX, deltaY, minSwipeDistancePx }) {
  if (Math.abs(deltaX) < minSwipeDistancePx) {
    return false;
  }

  return Math.abs(deltaX) >= Math.abs(deltaY) * HORIZONTAL_DOMINANCE_RATIO;
}

/**
 * @param {{
 *   enabled?: boolean;
 *   onSwipeLeft?: () => void;
 *   onSwipeRight?: () => void;
 *   minSwipeDistancePx?: number;
 *   onSwipe?: () => void;
 * }} options
 */
export function useHorizontalSwipeNavigation({
  enabled = true,
  onSwipeLeft,
  onSwipeRight,
  minSwipeDistancePx = DEFAULT_MIN_SWIPE_DISTANCE_PX,
  onSwipe,
}) {
  const pointerStartRef = useRef(null);
  const onSwipeLeftRef = useRef(onSwipeLeft);
  const onSwipeRightRef = useRef(onSwipeRight);
  const onSwipeRef = useRef(onSwipe);

  useEffect(() => {
    onSwipeLeftRef.current = onSwipeLeft;
    onSwipeRightRef.current = onSwipeRight;
    onSwipeRef.current = onSwipe;
  }, [onSwipeLeft, onSwipeRight, onSwipe]);

  const releasePointerCapture = useCallback((target, pointerId) => {
    if (target instanceof Element && target.hasPointerCapture?.(pointerId)) {
      target.releasePointerCapture(pointerId);
    }
  }, []);

  const resetPointerStart = useCallback(
    (target, pointerId) => {
      if (pointerId != null) {
        releasePointerCapture(target, pointerId);
      }
      pointerStartRef.current = null;
    },
    [releasePointerCapture],
  );

  const resolveNavigation = useCallback((deltaX) => {
    onSwipeRef.current?.();

    if (deltaX < 0) {
      onSwipeLeftRef.current?.();
      return;
    }

    onSwipeRightRef.current?.();
  }, []);

  const onPointerDown = useCallback(
    (event) => {
      if (!enabled || event.button !== 0) {
        return;
      }

      const target = event.target;
      if (target instanceof Element && target.closest(INTERACTIVE_SELECTOR)) {
        return;
      }

      event.stopPropagation();
      pointerStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        pointerId: event.pointerId,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [enabled],
  );

  const onPointerMove = useCallback(
    (event) => {
      const pointerStart = pointerStartRef.current;
      if (!enabled || !pointerStart || pointerStart.pointerId !== event.pointerId) {
        return;
      }

      event.stopPropagation();
      const deltaX = event.clientX - pointerStart.x;
      const deltaY = event.clientY - pointerStart.y;

      if (Math.abs(deltaY) > Math.abs(deltaX) * HORIZONTAL_DOMINANCE_RATIO) {
        resetPointerStart(event.currentTarget, event.pointerId);
      }
    },
    [enabled, resetPointerStart],
  );

  const onPointerUp = useCallback(
    (event) => {
      if (!enabled) {
        return;
      }

      event.stopPropagation();
      const pointerStart = pointerStartRef.current;
      resetPointerStart(event.currentTarget, event.pointerId);

      if (!pointerStart || pointerStart.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - pointerStart.x;
      const deltaY = event.clientY - pointerStart.y;

      if (!shouldNavigateHorizontal({ deltaX, deltaY, minSwipeDistancePx })) {
        return;
      }

      resolveNavigation(deltaX);
    },
    [enabled, minSwipeDistancePx, resetPointerStart, resolveNavigation],
  );

  const onPointerCancel = useCallback(
    (event) => {
      event.stopPropagation();
      resetPointerStart(event.currentTarget, event.pointerId);
    },
    [resetPointerStart],
  );

  return enabled
    ? {
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
      }
    : {};
}
