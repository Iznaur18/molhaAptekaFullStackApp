const LOCAL_API_UPLOAD_ORIGIN_RE =
  /^https?:\/\/127\.0\.0\.1:4444(\/uploads\/.+)$/i;

/**
 * Превращает ответ upload в URL, который браузер грузит с того же origin, что и SPA.
 * Нужно для LAN dev (192.168.x.x:5173) и Vite proxy.
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

  const legacyMatch = url.match(LOCAL_API_UPLOAD_ORIGIN_RE);
  if (legacyMatch) {
    return `${window.location.origin}${legacyMatch[1]}`;
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
 * @param {string} raw
 * @returns {string}
 */
export function resolveImageUrlForDisplay(raw) {
  return resolveUploadedImageUrl(raw);
}
