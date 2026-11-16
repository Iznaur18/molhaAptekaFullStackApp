const SHIFT_EPSILON_PX = 2;

/**
 * Сдвиг `translateY`, чтобы низ бара совпал с низом visual viewport минус CSS `bottom`.
 * `getBoundingClientRect` — координаты layout viewport.
 *
 * @param {{
 *   currentShiftY: number;
 *   rectBottom: number;
 *   rectHeight: number;
 *   layoutGapPx: number;
 *   visualOffsetTop: number;
 *   visualHeight: number;
 * }} input
 * @returns {number}
 */
export function resolveMobileBottomNavShiftY({
  currentShiftY,
  rectBottom,
  rectHeight,
  layoutGapPx,
  visualOffsetTop,
  visualHeight,
}) {
  if (!(rectHeight > 0) || !(visualHeight > 0)) {
    return 0;
  }

  const gap = Number.isFinite(layoutGapPx) ? Math.max(0, layoutGapPx) : 0;
  const desiredBottom = visualOffsetTop + visualHeight - gap;
  const untransformedBottom = rectBottom - currentShiftY;
  const next = desiredBottom - untransformedBottom;
  if (!Number.isFinite(next) || Math.abs(next) > visualHeight) {
    return currentShiftY;
  }
  if (Math.abs(next - currentShiftY) < SHIFT_EPSILON_PX) {
    return currentShiftY;
  }
  return Math.round(next * 10) / 10;
}
