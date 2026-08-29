/** Выше — не подставляем адрес из reverse geocode (типично IP-геолокация на ПК). */
export const GEOLOCATION_LOW_ACCURACY_THRESHOLD_M = 1500;

/** Достаточно точно — сразу принимаем координаты из watchPosition. */
export const GEOLOCATION_TARGET_ACCURACY_M = 100;

export const GEOLOCATION_TIMEOUT_MS = 15_000;

export const GEOLOCATION_WATCH_MAX_MS = 10_000;

/**
 * @param {number} accuracyMeters
 */
export function isGeolocationAccuracyLow(accuracyMeters) {
  return !Number.isFinite(accuracyMeters) || accuracyMeters > GEOLOCATION_LOW_ACCURACY_THRESHOLD_M;
}

/**
 * @param {number} accuracyMeters
 * @param {string} template — с плейсхолдером `{distance}`
 */
export function formatGeolocationLowAccuracyMessage(accuracyMeters, template) {
  const distance =
    Number.isFinite(accuracyMeters) && accuracyMeters >= 1000
      ? `~${Math.max(1, Math.round(accuracyMeters / 1000))} км`
      : Number.isFinite(accuracyMeters)
        ? `~${Math.round(accuracyMeters)} м`
        : "неизвестна";
  return template.replace("{distance}", distance);
}
