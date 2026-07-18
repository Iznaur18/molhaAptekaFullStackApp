import { parseUploadFilenameFromMediaUrl } from "./parseUploadFilenameFromMediaUrl.js";

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

/**
 * Любой URL с `/uploads/...` → канонический путь для БД (относительный или PUBLIC_UPLOAD_BASE_URL).
 * Небезопасные имена (`..`, `\`) отклоняются — URL остаётся как есть без нормализации в uploads.
 *
 * @param {string} raw
 * @returns {string}
 */
export function normalizeStoredUploadUrl(raw) {
  const url = String(raw ?? "").trim();
  if (!url) return "";

  const filename = parseUploadFilenameFromMediaUrl(url);
  if (!filename) {
    return url;
  }

  return buildPublicUploadUrl({ filename });
}
