import type { InstallmentPlan } from "@/entities/installment/api/installmentApi";

/** Последний план в массиве API; если один — он же. */
export const resolveLastInstallmentPlan = (
  plans: InstallmentPlan[] | null | undefined,
): InstallmentPlan | null => {
  if (!Array.isArray(plans) || plans.length === 0) {
    return null;
  }

  return plans[plans.length - 1] ?? null;
};

export const resolveInstallmentPlanMonthlyAmountRub = (
  plan: InstallmentPlan | null | undefined,
): number | null => {
  if (plan == null) {
    return null;
  }

  const monthly = Math.floor(Number(plan.monthlyAmountRub));
  if (!Number.isFinite(monthly) || monthly < 1) {
    return null;
  }

  return monthly;
};
