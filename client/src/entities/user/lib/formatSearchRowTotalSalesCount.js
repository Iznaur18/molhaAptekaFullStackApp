/**
 * @param {number | undefined} totalSalesCount
 * @returns {number}
 */
export function normalizeTotalSalesCount(totalSalesCount) {
  const n = Number(totalSalesCount);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

/**
 * @param {number | undefined} totalSalesCount
 * @returns {string}
 */
export function formatSearchRowTotalSalesCount(totalSalesCount) {
  return String(normalizeTotalSalesCount(totalSalesCount));
}
