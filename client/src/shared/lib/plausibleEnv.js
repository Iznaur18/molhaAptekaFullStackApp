/**
 * Plausible (внешний traffic) — включается только если задан domain.
 * @see docs/analytics/metrics.md § Traffic
 */

/** @returns {string} */
export function getPlausibleDomain() {
  return String(import.meta.env.VITE_PLAUSIBLE_DOMAIN ?? "").trim();
}

/** @returns {boolean} */
export function isPlausibleEnabled() {
  return getPlausibleDomain().length > 0;
}

/** Script URL (cloud или self-hosted). */
export function getPlausibleScriptSrc() {
  const custom = String(import.meta.env.VITE_PLAUSIBLE_SCRIPT_SRC ?? "").trim();
  return custom || "https://plausible.io/js/script.js";
}

/** Опциональная shared dashboard ссылка для admin UI. */
export function getPlausibleSharedDashboardUrl() {
  return String(import.meta.env.VITE_PLAUSIBLE_SHARED_URL ?? "").trim();
}
