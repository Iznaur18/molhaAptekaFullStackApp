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
