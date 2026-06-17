import {
  normalizeUploadUrlForStorage,
  resolveUploadedImageUrlForBrowser,
} from "@izibuy/shared-lib";

const UPLOAD_ASSET_PATH_RE = /(\/uploads\/[^?#]+)/i;

export { resolveUploadedImageUrlForBrowser };

/**
 * Превращает ответ upload в URL для <img>/<video>.
 * CDN (`https://cdn.../uploads/...`) не переписывается на origin SPA.
 *
 * @param {string} raw
 * @returns {string}
 */
export function resolveUploadedImageUrl(raw) {
  const url = String(raw ?? "").trim();
  if (!url) {
    return "";
  }

  if (typeof window === "undefined") {
    return url;
  }

  return resolveUploadedImageUrlForBrowser(url, window.location.origin);
}

/**
 * @param {string} raw
 * @returns {boolean}
 */
export function isHttpImageUrl(raw) {
  return typeof raw === "string" && /^https?:\/\//i.test(raw.trim());
}

/**
 * URL для слайда/`<img>`: http(s), data:image, /uploads.
 *
 * @param {unknown} raw
 */
export function isDisplayableProductImageUrl(raw) {
  const url = String(raw ?? "").trim();
  if (!url) {
    return false;
  }
  if (/^data:image\//i.test(url)) {
    return true;
  }
  if (isHttpImageUrl(url)) {
    return true;
  }
  return url.startsWith("/uploads/") || UPLOAD_ASSET_PATH_RE.test(url);
}

/**
 * URL с сервера uploads или внешний http(s) — можно показать через resolveImageUrlForDisplay.
 *
 * @param {unknown} raw
 */
export function isStoredUploadOrHttpImageUrl(raw) {
  const url = String(raw ?? "").trim();
  if (!url) {
    return false;
  }
  if (isHttpImageUrl(url)) {
    return true;
  }
  return url.startsWith("/uploads/") || UPLOAD_ASSET_PATH_RE.test(url);
}

/**
 * @param {string} raw
 * @returns {string}
 */
export function resolveImageUrlForDisplay(raw) {
  return resolveUploadedImageUrl(raw);
}

export { normalizeUploadUrlForStorage };
