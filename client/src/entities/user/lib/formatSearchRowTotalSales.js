import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

const COMPACT_AMOUNT_THRESHOLD = 10_000;
const COMPACT_THOUSAND_DIVISOR = 1_000;
const COMPACT_MILLION_DIVISOR = 1_000_000;
const COMPACT_THOUSAND_SUFFIX = "К";
const COMPACT_MILLION_SUFFIX = "М";

/**
 * @param {number | undefined} totalSalesAmount
 * @returns {number}
 */
export function normalizeTotalSalesAmount(totalSalesAmount) {
  const n = Number(totalSalesAmount);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

/**
 * @param {number} amount
 * @param {number} divisor
 * @param {string} suffix
 * @returns {string}
 */
function formatCompactAmountPart(amount, divisor, suffix) {
  const scaled = amount / divisor;
  const rounded = Math.round(scaled * 10) / 10;
  const text =
    Number.isInteger(rounded) ? String(rounded) : String(rounded).replace(/\.0$/, "");

  return `${text}${suffix}`;
}

/**
 * @param {number} amount
 * @returns {string}
 */
function formatCompactSearchRowAmount(amount) {
  if (amount >= COMPACT_MILLION_DIVISOR) {
    return formatCompactAmountPart(
      amount,
      COMPACT_MILLION_DIVISOR,
      COMPACT_MILLION_SUFFIX,
    );
  }

  return formatCompactAmountPart(
    amount,
    COMPACT_THOUSAND_DIVISOR,
    COMPACT_THOUSAND_SUFFIX,
  );
}

/**
 * @param {number | undefined} totalSalesAmount
 */
export function formatSearchRowTotalSales(totalSalesAmount) {
  const amount = normalizeTotalSalesAmount(totalSalesAmount);

  if (amount < COMPACT_AMOUNT_THRESHOLD) {
    return formatPriceRub(amount);
  }

  return formatCompactSearchRowAmount(amount);
}
