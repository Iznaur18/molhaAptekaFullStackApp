import { isPlausibleEnabled } from "./plausibleEnv.js";

/**
 * SPA pageview для Plausible (после смены route).
 */
export function trackPlausiblePageview() {
  if (typeof window === "undefined" || !isPlausibleEnabled()) {
    return;
  }

  if (typeof window.plausible === "function") {
    window.plausible("pageview");
  }
}
