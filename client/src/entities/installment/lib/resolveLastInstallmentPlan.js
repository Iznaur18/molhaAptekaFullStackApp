/**
 * Последний план в массиве API; если один — он же.
 *
 * @param {import("../model/types.js").InstallmentPlanFromApi[] | null | undefined} plans
 */
export function resolveLastInstallmentPlan(plans) {
  if (!Array.isArray(plans) || plans.length === 0) {
    return null;
  }
  return plans[plans.length - 1] ?? null;
}

/**
 * @param {import("../model/types.js").InstallmentPlanFromApi | null | undefined} plan
 * @returns {number | null}
 */
export function resolveInstallmentPlanMonthlyAmountRub(plan) {
  if (plan == null) {
    return null;
  }
  const monthly = Math.floor(Number(plan.monthlyAmountRub));
  if (!Number.isFinite(monthly) || monthly < 1) {
    return null;
  }
  return monthly;
}
