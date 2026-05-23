import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

/**
 * @param {number | undefined} totalSalesAmount
 * @returns {number}
 */
export function normalizeTotalSalesAmount(totalSalesAmount) {
  const n = Number(totalSalesAmount);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

/**
 * @param {number | undefined} totalSalesAmount
 */
export function formatSearchRowTotalSales(totalSalesAmount) {
  return formatPriceRub(normalizeTotalSalesAmount(totalSalesAmount));
}
