import { WEB_APP_SHELL_MAX_WIDTH_PX } from "./appShellLayoutConstants.js";

/**
 * @param {number} windowWidth
 * @returns {number}
 */
export function resolveAppViewportWidth(windowWidth) {
  if (!Number.isFinite(windowWidth) || windowWidth <= 0) {
    return WEB_APP_SHELL_MAX_WIDTH_PX;
  }

  return Math.min(windowWidth, WEB_APP_SHELL_MAX_WIDTH_PX);
}
