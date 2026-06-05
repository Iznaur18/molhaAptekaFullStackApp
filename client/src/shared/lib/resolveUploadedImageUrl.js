const UPLOAD_ASSET_PATH_RE = /(\/uploads\/[^?#]+)/i;

/**
 * Логика отображения upload URL в браузере (тестируется без window).
 *
 * @param {string} raw
 * @param {string} pageOrigin — window.location.origin
 * @returns {string}
 */
export function resolveUploadedImageUrlForBrowser(raw, pageOrigin) {
  const url = String(raw ?? "").trim();
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      const pathMatch = parsed.pathname.match(UPLOAD_ASSET_PATH_RE);
      if (pathMatch && parsed.origin === pageOrigin) {
        return `${pageOrigin}${pathMatch[1]}`;
      }
      return url;
    } catch {
      return url;
    }
  }

  const uploadPathMatch = url.match(UPLOAD_ASSET_PATH_RE);
  if (uploadPathMatch) {
    return `${pageOrigin}${uploadPathMatch[1]}`;
  }

  if (url.startsWith("/")) {
    return `${pageOrigin}${url}`;
  }

  return url;
}

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
