const trimTrailingSlash = (url) => url.replace(/\/$/, "");

/**
 * Без PUBLIC_UPLOAD_BASE_URL возвращает относительный путь — клиент
 * подставит свой origin (Vite proxy, LAN dev).
 *
 * @param {{ filename: string }} params
 * @returns {string}
 */
export function buildPublicUploadUrl({ filename }) {
  const relativePath = `/uploads/${filename}`;
  const configured = process.env.PUBLIC_UPLOAD_BASE_URL?.trim();

  if (configured) {
    return `${trimTrailingSlash(configured)}${relativePath}`;
  }

  return relativePath;
}

const UPLOAD_ASSET_PATH_RE = /(\/uploads\/[^?#]+)/i;

/**
 * Любой URL с `/uploads/...` → канонический путь для БД (относительный или PUBLIC_UPLOAD_BASE_URL).
 *
 * @param {string} raw
 * @returns {string}
 */
export function normalizeStoredUploadUrl(raw) {
  const url = String(raw ?? "").trim();
  if (!url) return "";

  const uploadPathMatch = url.match(UPLOAD_ASSET_PATH_RE);
  if (!uploadPathMatch) {
    return url;
  }

  const filename = uploadPathMatch[1].replace(/^\/uploads\//, "");
  if (!filename) {
    return url;
  }

  return buildPublicUploadUrl({ filename });
}
