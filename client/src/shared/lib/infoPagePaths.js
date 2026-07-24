/**
 * Info pages from header stretch-menu (parity with mobile `/faq`, `/legal/*`).
 */

/**
 * @param {string} pathname
 */
export function isFaqPath(pathname) {
  const normalized = (pathname || "/").replace(/\/+$/, "") || "/";
  return normalized === "/faq";
}

/**
 * @param {string} pathname
 * @returns {string | null} kind or null
 */
export function parseLegalKindFromPathname(pathname) {
  const normalized = (pathname || "/").replace(/\/+$/, "") || "/";
  const match = normalized.match(/^\/legal\/(terms|privacy|listing|offer)$/);
  return match ? match[1] : null;
}

/**
 * @param {string} pathname
 */
export function isLegalPath(pathname) {
  return parseLegalKindFromPathname(pathname) != null;
}

/**
 * @param {string} pathname
 */
export function isInfoPagePath(pathname) {
  return isFaqPath(pathname) || isLegalPath(pathname);
}
