import { API_BASE_URL } from "./apiBaseUrl";

const trimTrailingSlash = (url: string) => url.replace(/\/$/, "");

/**
 * CDN или API origin для `/uploads/...`.
 * Prod: EXPO_PUBLIC_UPLOAD_BASE_URL=https://cdn.izibuy.ru
 */
export const UPLOAD_BASE_URL = (() => {
  const fromEnv = process.env.EXPO_PUBLIC_UPLOAD_BASE_URL?.trim();
  if (fromEnv) {
    return trimTrailingSlash(fromEnv);
  }
  return API_BASE_URL;
})();
