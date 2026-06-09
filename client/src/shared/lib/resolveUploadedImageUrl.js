const UPLOAD_ASSET_PATH_RE = /(\/uploads\/[^?#]+)/i;

/**
 * Dev SPA (Vite): другой LAN IP / localhost в БД — файлы на том же API через proxy.
 *
 * @param {string} origin
 */
function isDevSpaUploadOrigin(origin) {
  try {
    const parsed = new URL(origin);
    if (parsed.port === "5173" || parsed.port === "4173") {
      return true;
    }
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") {
      return true;
    }
    if (/^192\.168\./.test(host) || /^10\./.test(host)) {
      return true;
    }
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

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
      if (pathMatch) {
        if (parsed.origin === pageOrigin || isDevSpaUploadOrigin(parsed.origin)) {
          return `${pageOrigin}${pathMatch[1]}`;
        }
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
 * Канонический путь `/uploads/...` для сохранения в БД (без origin SPA).
 *
 * @param {string} raw
 * @returns {string}
 */
export function normalizeUploadUrlForStorage(raw) {
  const url = String(raw ?? "").trim();
  if (!url) {
    return "";
  }

  const uploadPathMatch = url.match(UPLOAD_ASSET_PATH_RE);
  if (uploadPathMatch) {
    return uploadPathMatch[1];
  }

  if (url.startsWith("/uploads/")) {
    return url;
  }

  return url;
}

/**
 * @param {string} raw
 * @returns {string}
 */
export function resolveImageUrlForDisplay(raw) {
  return resolveUploadedImageUrl(raw);
}
