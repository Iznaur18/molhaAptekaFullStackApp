import {
  resolveWebContentMaxWidth,
  WEB_APP_SHELL_MAX_WIDTH_PX,
} from "./appShellLayoutConstants.js";

/**
 * Эффективная ширина контента app-shell (паритет с mobile layout column).
 *
 * @param {number} windowWidth
 * @returns {number}
 */
export function resolveAppViewportWidth(windowWidth) {
  if (!Number.isFinite(windowWidth) || windowWidth <= 0) {
    return WEB_APP_SHELL_MAX_WIDTH_PX;
  }

  return Math.min(windowWidth, resolveWebContentMaxWidth(windowWidth));
}
