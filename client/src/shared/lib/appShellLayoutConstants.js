/** Паритет с mobile `screenBreakpoints.ts` — content max-width. */
export const WEB_CONTENT_MAX_WIDTH_SMALL_TABLET_PX = 520;
export const WEB_CONTENT_MAX_WIDTH_MEDIUM_TABLET_PX = 720;
export const WEB_CONTENT_MAX_WIDTH_LARGE_PX = 960;
/** ≥1280: 960 × 1.25 */
export const WEB_CONTENT_MAX_WIDTH_WIDE_PX = 1200;

/** Паритет с mobile tablet tiers. */
export const WEB_SMALL_TABLET_MIN_PX = 600;
export const WEB_MEDIUM_TABLET_MIN_PX = 768;
export const WEB_LARGE_TABLET_MIN_PX = 1024;
export const WEB_WIDE_DESKTOP_MIN_PX = 1280;

/** Desktop / wide content cap. */
export const WEB_APP_SHELL_MAX_WIDTH_PX = WEB_CONTENT_MAX_WIDTH_WIDE_PX;

/** Tablet upper bound (legacy alias): до large-tablet. */
export const APP_SHELL_TABLET_MAX_PX = WEB_LARGE_TABLET_MIN_PX - 1;

/** Desktop from this width (inclusive). */
export const APP_SHELL_DESKTOP_MIN_PX = WEB_LARGE_TABLET_MIN_PX;

/**
 * Max-width контентной колонки как в mobile `resolveContentMaxWidth`.
 * Phone — без капа (возвращает windowWidth).
 *
 * @param {number} windowWidth
 * @returns {number}
 */
export function resolveWebContentMaxWidth(windowWidth) {
  if (!Number.isFinite(windowWidth) || windowWidth <= 0) {
    return WEB_APP_SHELL_MAX_WIDTH_PX;
  }

  if (windowWidth >= WEB_WIDE_DESKTOP_MIN_PX) {
    return WEB_CONTENT_MAX_WIDTH_WIDE_PX;
  }

  if (windowWidth >= WEB_LARGE_TABLET_MIN_PX) {
    return WEB_CONTENT_MAX_WIDTH_LARGE_PX;
  }

  if (windowWidth >= WEB_MEDIUM_TABLET_MIN_PX) {
    return WEB_CONTENT_MAX_WIDTH_MEDIUM_TABLET_PX;
  }

  if (windowWidth >= WEB_SMALL_TABLET_MIN_PX) {
    return WEB_CONTENT_MAX_WIDTH_SMALL_TABLET_PX;
  }

  return windowWidth;
}
