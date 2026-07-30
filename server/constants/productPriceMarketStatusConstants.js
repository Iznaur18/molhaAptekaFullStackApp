/** Статус цены относительно рынка (блок 2 на деталях). */
export const PRODUCT_PRICE_MARKET_STATUS_ABOVE = "above_market";
export const PRODUCT_PRICE_MARKET_STATUS_AT = "at_market";
export const PRODUCT_PRICE_MARKET_STATUS_BELOW = "below_market";
export const PRODUCT_PRICE_MARKET_STATUS_UNKNOWN = "unknown";

export const PRODUCT_PRICE_MARKET_STATUS_VALUES = [
  PRODUCT_PRICE_MARKET_STATUS_ABOVE,
  PRODUCT_PRICE_MARKET_STATUS_AT,
  PRODUCT_PRICE_MARKET_STATUS_BELOW,
  PRODUCT_PRICE_MARKET_STATUS_UNKNOWN,
];

export const PRODUCT_PRICE_MARKET_STATUS_DEFAULT = PRODUCT_PRICE_MARKET_STATUS_UNKNOWN;

/** Допуск относительно медианы peer-цен (±12%). */
export const PRODUCT_PRICE_MARKET_STATUS_BAND_RATIO = 0.12;

/** Минимум аналогов для выставления статуса (иначе unknown). */
export const PRODUCT_PRICE_MARKET_STATUS_MIN_PEERS = 3;

/** Суточный cron пересчёта. */
export const PRODUCT_PRICE_MARKET_STATUS_CRON_INTERVAL_MS = 24 * 60 * 60 * 1000;

/** Размер батча в cron. */
export const PRODUCT_PRICE_MARKET_STATUS_CRON_BATCH_SIZE = 50;

/**
 * @param {number[]} values
 * @returns {number | null}
 */
export function medianPositiveNumbers(values) {
  const sorted = values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);

  if (sorted.length === 0) {
    return null;
  }

  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[mid];
  }

  return (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * @param {{
 *   productPrice: unknown;
 *   peerPrices: unknown[];
 *   minPeers?: number;
 *   bandRatio?: number;
 * }} input
 * @returns {(typeof PRODUCT_PRICE_MARKET_STATUS_VALUES)[number]}
 */
export function resolveProductPriceMarketStatusFromPeers({
  productPrice,
  peerPrices,
  minPeers = PRODUCT_PRICE_MARKET_STATUS_MIN_PEERS,
  bandRatio = PRODUCT_PRICE_MARKET_STATUS_BAND_RATIO,
}) {
  const price = Math.floor(Number(productPrice));
  if (!Number.isFinite(price) || price <= 0) {
    return PRODUCT_PRICE_MARKET_STATUS_UNKNOWN;
  }

  const peers = (Array.isArray(peerPrices) ? peerPrices : [])
    .map((value) => Math.floor(Number(value)))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (peers.length < minPeers) {
    return PRODUCT_PRICE_MARKET_STATUS_UNKNOWN;
  }

  const median = medianPositiveNumbers(peers);
  if (median == null || median <= 0) {
    return PRODUCT_PRICE_MARKET_STATUS_UNKNOWN;
  }

  const low = median * (1 - bandRatio);
  const high = median * (1 + bandRatio);

  if (price < low) {
    return PRODUCT_PRICE_MARKET_STATUS_BELOW;
  }
  if (price > high) {
    return PRODUCT_PRICE_MARKET_STATUS_ABOVE;
  }
  return PRODUCT_PRICE_MARKET_STATUS_AT;
}
