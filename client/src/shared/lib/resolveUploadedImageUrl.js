const UPLOAD_ASSET_PATH_RE = /(\/uploads\/[^?#]+)/i;

/**
 * Превращает ответ upload в URL, который браузер грузит с того же origin, что и SPA.
 * Нужно для LAN dev (192.168.x.x:5173), Vite proxy и prod после сохранения URL с чужим origin.
 *
 * @param {string} raw
 * @returns {string}
 */
export function resolveUploadedImageUrl(raw) {
  const url = String(raw ?? "").trim();
  if (!url) return "";

  if (typeof window === "undefined") {
    return url;
  }

  const uploadPathMatch = url.match(UPLOAD_ASSET_PATH_RE);
  if (uploadPathMatch) {
    return `${window.location.origin}${uploadPathMatch[1]}`;
  }

  if (url.startsWith("/")) {
    return `${window.location.origin}${url}`;
  }

  return url;
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
