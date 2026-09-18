import {
  MARKETING_ATTRIBUTION_STORAGE_KEY,
  mergeMarketingAttribution,
  readMarketingTouch,
  sanitizeMarketingAttribution,
  selectMarketingAttributionForSubmit,
} from "@izibuy/shared-lib";

/** Свой сайт — переходы с него не считаются источником. */
const SITE_HOSTS = ["gitorg.ru"];

/** Реферер читаем один раз за загрузку: при переходах внутри SPA он не меняется. */
let referrerConsumed = false;

/**
 * @returns {import("@izibuy/shared-lib").MarketingAttribution | null}
 */
function readStoredAttribution() {
  try {
    const raw = window.localStorage.getItem(MARKETING_ATTRIBUTION_STORAGE_KEY);
    return raw ? sanitizeMarketingAttribution(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/**
 * Запоминает, откуда пришёл посетитель: UTM-метки из адреса и внешний
 * реферер. Первое касание не перезаписывается, последнее — да.
 *
 * @param {string} [search] `location.search`
 * @param {{ now?: Date }} [options]
 * @returns {import("@izibuy/shared-lib").MarketingAttribution | null}
 */
export function captureMarketingAttribution(search, options = {}) {
  if (typeof window === "undefined") {
    return null;
  }

  const includeReferrer = !referrerConsumed;
  referrerConsumed = true;

  const touch = readMarketingTouch({
    search: search ?? window.location.search,
    referrer: includeReferrer ? document.referrer : "",
    landingPath: window.location.pathname,
    siteHosts: [...SITE_HOSTS, window.location.hostname],
    now: options.now,
  });
  if (!touch) {
    return readStoredAttribution();
  }

  const merged = mergeMarketingAttribution(readStoredAttribution(), touch);
  try {
    window.localStorage.setItem(
      MARKETING_ATTRIBUTION_STORAGE_KEY,
      JSON.stringify(merged),
    );
  } catch {
    // приватный режим или переполненное хранилище — атрибуция не критична
  }
  return merged;
}

/**
 * Что приложить к регистрации или заказу.
 *
 * @param {Date} [now]
 * @returns {import("@izibuy/shared-lib").MarketingAttribution | null}
 */
export function readMarketingAttributionForSubmit(now = new Date()) {
  if (typeof window === "undefined") {
    return null;
  }
  return selectMarketingAttributionForSubmit(readStoredAttribution(), now);
}

/** Только для тестов. */
export function resetMarketingAttributionCaptureState() {
  referrerConsumed = false;
}
