const trimTrailingSlash = (url) => url.replace(/\/$/, "");

const fromEnv = import.meta.env.VITE_API_URL;

/**
 * Префикс для fetch: в dev с proxy — '' (пути вида `/auth/...`).
 * В production задай VITE_API_URL в .env.
 */
export const API_BASE_URL =
  import.meta.env.PROD && fromEnv ? trimTrailingSlash(String(fromEnv)) : "";
