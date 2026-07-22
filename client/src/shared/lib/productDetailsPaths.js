/**
 * SPA-страница деталей товара: `/product/:productId` (Mongo ObjectId).
 * Не путать с API-префиксом `/product/...` (прокси Vite / nginx → Express).
 */

/** Только 24 hex — как `mongoIdSchema` в `@molha/api-contract`. */
const PRODUCT_DETAILS_PATH_RE = /^\/product\/([a-f\d]{24})$/i;

/**
 * @param {string} pathname
 * @returns {string | null}
 */
export function parseProductIdFromPathname(pathname) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const match = normalized.match(PRODUCT_DETAILS_PATH_RE);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * @param {string} pathname
 */
export function isProductDetailsPath(pathname) {
  return parseProductIdFromPathname(pathname) != null;
}

/**
 * Dev/preview proxy (Vite): true → API, false → `index.html` (SPA).
 * @param {string} pathname
 */
export function shouldProxyProductPathToApi(pathname) {
  if (pathname === "/product") {
    return true;
  }
  if (!pathname.startsWith("/product/")) {
    return false;
  }
  if (isProductDetailsPath(pathname)) {
    return false;
  }
  return true;
}
