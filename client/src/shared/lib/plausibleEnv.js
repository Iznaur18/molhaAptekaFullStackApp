/**
 * Plausible (внешний traffic).
 * Новый формат: `pa-….js` + `plausible.init()` — включается через SCRIPT_SRC.
 * Legacy: classic `script.js` + `data-domain` — DOMAIN + optional SCRIPT_SRC.
 * @see docs/analytics/metrics.md § Traffic
 */

/** @returns {string} */
export function getPlausibleDomain() {
  return String(import.meta.env.VITE_PLAUSIBLE_DOMAIN ?? "").trim();
}

/** Script URL из кабинета Plausible (pa-….js или classic). */
export function getPlausibleScriptSrc() {
  return String(import.meta.env.VITE_PLAUSIBLE_SCRIPT_SRC ?? "").trim();
}

/** @returns {boolean} */
export function isPlausibleEnabled() {
  return getPlausibleScriptSrc().length > 0 || getPlausibleDomain().length > 0;
}

/** pa-….js — site id в имени файла, data-domain не нужен. */
export function isPlausiblePaScript(src = getPlausibleScriptSrc()) {
  return /\/pa-[^/]+\.js(?:\?|$)/i.test(src);
}

/** Опциональная shared dashboard ссылка для admin UI. */
export function getPlausibleSharedDashboardUrl() {
  return String(import.meta.env.VITE_PLAUSIBLE_SHARED_URL ?? "").trim();
}

/** Resolve script src: explicit env, else classic cloud if domain set. */
export function resolvePlausibleScriptSrc() {
  const custom = getPlausibleScriptSrc();
  if (custom) {
    return custom;
  }
  if (getPlausibleDomain()) {
    return "https://plausible.io/js/script.js";
  }
  return "";
}
