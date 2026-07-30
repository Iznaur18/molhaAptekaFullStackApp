import { INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB } from "../model/constants.js";

/**
 * @param {number} productPrice
 * @param {number} monthsCount
 * @param {number} markupPercent
 * @returns {number}
 */
export function resolveInstallmentMonthlyFromMarkupPercent(
  productPrice,
  monthsCount,
  markupPercent,
) {
  const productPriceRub = Math.max(0, Math.floor(Number(productPrice) || 0));
  const safeMonths = Math.max(0, Math.floor(Number(monthsCount) || 0));
  const safePercent = Math.max(0, Number(markupPercent) || 0);

  if (productPriceRub <= 0 || safeMonths <= 0) {
    return INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB;
  }

  const planTotalRub = Math.ceil(productPriceRub * (1 + safePercent / 100));
  const monthlyAmountRub = Math.ceil(planTotalRub / safeMonths);

  return Math.max(INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB, monthlyAmountRub);
}

/**
 * @param {number} productPrice
 * @param {number} monthsCount
 * @param {number} monthlyAmountRub
 * @returns {{
 *   productPriceRub: number;
 *   planTotalRub: number;
 *   markupRub: number;
 *   markupPercent: number;
 * }}
 */
export function resolveInstallmentPlanPriceSummary(
  productPrice,
  monthsCount,
  monthlyAmountRub,
) {
  const productPriceRub = Math.max(0, Math.floor(Number(productPrice) || 0));
  const safeMonths = Math.max(0, Math.floor(Number(monthsCount) || 0));
  const safeMonthly = Math.max(0, Math.floor(Number(monthlyAmountRub) || 0));
  const planTotalRub = safeMonths * safeMonthly;
  const markupRub = Math.max(0, planTotalRub - productPriceRub);
  const markupPercent =
    productPriceRub > 0 ? Math.round((markupRub / productPriceRub) * 100) : 0;

  return {
    productPriceRub,
    planTotalRub,
    markupRub,
    markupPercent,
  };
}
