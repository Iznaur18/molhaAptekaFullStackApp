/**
 * @returns {string}
 */
export function resolveYandexMapsApiKey() {
  const raw = import.meta.env.VITE_YANDEX_MAPS_API_KEY;
  return typeof raw === "string" ? raw.trim() : "";
}

export function isYandexMapsApiKeyConfigured() {
  return resolveYandexMapsApiKey().length > 0;
}
