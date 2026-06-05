export const SELLER_PRODUCTS_PATH_PREFIX = "/seller";

/**
 * @param {string} sellerUserId
 */
export function buildSellerProductsPath(sellerUserId) {
  return `${SELLER_PRODUCTS_PATH_PREFIX}/${encodeURIComponent(sellerUserId)}`;
}

/**
 * @param {string} pathname
 */
export function parseSellerIdFromPathname(pathname) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const match = normalized.match(/^\/seller\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * @param {string} pathname
 */
export function isSellerProductsPath(pathname) {
  return parseSellerIdFromPathname(pathname) != null;
}
