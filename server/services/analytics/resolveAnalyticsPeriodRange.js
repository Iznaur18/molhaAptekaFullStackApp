import {
  ADMIN_ANALYTICS_PERIOD_7D,
  ADMIN_ANALYTICS_PERIOD_30D,
  ADMIN_ANALYTICS_PERIOD_ALL,
  ADMIN_ANALYTICS_PERIOD_TODAY,
} from "../../constants/analyticsConstants.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * @param {string} period
 * @param {Date} [asOf]
 * @returns {{ key: string; from: Date | null; to: Date }}
 */
export function resolveAnalyticsPeriodRange(period, asOf = new Date()) {
  const to = new Date(asOf);
  const key = period || ADMIN_ANALYTICS_PERIOD_7D;

  if (key === ADMIN_ANALYTICS_PERIOD_ALL) {
    return { key, from: null, to };
  }

  if (key === ADMIN_ANALYTICS_PERIOD_TODAY) {
    const from = new Date(
      Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()),
    );
    return { key, from, to };
  }

  const days = key === ADMIN_ANALYTICS_PERIOD_30D ? 30 : 7;
  const from = new Date(to.getTime() - days * MS_PER_DAY);
  return { key, from, to };
}

/**
 * @param {Date | null} from
 * @param {Date} to
 * @param {string} [field]
 */
export function buildCreatedAtPeriodMatch(from, to, field = "createdAt") {
  if (from == null) {
    return { [field]: { $lte: to } };
  }
  return { [field]: { $gte: from, $lte: to } };
}
