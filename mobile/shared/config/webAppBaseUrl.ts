const DEFAULT_WEB_APP_URL = "https://izibuy.ru";

/** Публичный URL web SPA для staff-разделов (G.1). */
export const WEB_APP_BASE_URL =
  process.env.EXPO_PUBLIC_WEB_APP_URL?.trim() || DEFAULT_WEB_APP_URL;
