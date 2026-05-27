export const RAFFLE_PATH_PREFIX = "/raffle";

/**
 * @param {string} raffleId
 */
export function buildRafflePath(raffleId) {
  return `${RAFFLE_PATH_PREFIX}/${encodeURIComponent(raffleId)}`;
}

/**
 * @param {string} pathname
 */
export function parseRaffleIdFromPathname(pathname) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const match = normalized.match(/^\/raffle\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * @param {string} pathname
 */
export function isRaffleProductsPath(pathname) {
  return parseRaffleIdFromPathname(pathname) != null;
}
