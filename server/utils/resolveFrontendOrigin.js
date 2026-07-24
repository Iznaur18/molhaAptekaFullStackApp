const DEFAULT_FRONTEND_ORIGIN = "http://127.0.0.1:5173";

/**
 * FRONTEND_URL может быть списком origin через запятую (CORS / CSRF).
 *
 * @param {string | undefined | null} [raw]
 * @returns {string[]}
 */
export function parseFrontendOrigins(raw = process.env.FRONTEND_URL) {
  return String(raw ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

/**
 * Канонический origin SPA для редиректов / инвайт-ссылок (первый из списка).
 *
 * @param {string | undefined | null} [raw]
 * @returns {string}
 */
export function resolveFrontendOrigin(raw = process.env.FRONTEND_URL) {
  const origins = parseFrontendOrigins(raw);
  return origins[0] ?? DEFAULT_FRONTEND_ORIGIN;
}
