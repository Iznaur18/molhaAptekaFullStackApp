const trimTrailingSlash = (url: string) => url.replace(/\/$/, "");

/**
 * Базовый URL API для нативного клиента.
 * Dev на телефоне: LAN IP хоста, не 127.0.0.1 — см. mobile/README.md
 */
export const API_BASE_URL = (() => {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!fromEnv) {
    return "";
  }
  return trimTrailingSlash(fromEnv);
})();
