import {
  INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB,
  INSTALLMENT_MONTHS_MAX,
  INSTALLMENT_MONTHS_MIN,
  INSTALLMENT_PLAN_TITLE_MAX_LENGTH,
  INSTALLMENT_PLANS_MAX,
} from "@/entities/installment/model/programConstants";
import { INSTALLMENT_UI } from "@/shared/config";

export type InstallmentProgramPlanDraft = {
  title?: string;
  monthsCount?: number;
  monthlyAmountRub?: number;
  firstPaymentRequiredNow?: boolean;
  /**
   * Процент надбавки, который ввёл продавец. Это источник правды для поля
   * ввода: `monthlyAmountRub` считается из него, а не наоборот, иначе
   * округление ежемесячного платежа «перебивает» набранный процент.
   */
  markupPercent?: number;
};

export const validateInstallmentProgramPlans = (
  plans: InstallmentProgramPlanDraft[],
):
  | { ok: true }
  | { ok: false; message: string } => {
  if (!Array.isArray(plans) || plans.length === 0) {
    return { ok: false, message: INSTALLMENT_UI.PROGRAM_MODAL_ERROR_NO_PLANS };
  }

  if (plans.length > INSTALLMENT_PLANS_MAX) {
    return { ok: false, message: INSTALLMENT_UI.PROGRAM_MODAL_MAX_PLANS(INSTALLMENT_PLANS_MAX) };
  }

  for (let index = 0; index < plans.length; index += 1) {
    const planNumber = index + 1;
    const plan = plans[index] ?? {};
    const title = String(plan.title ?? "").trim();

    if (!title) {
      return { ok: false, message: INSTALLMENT_UI.PROGRAM_MODAL_ERROR_PLAN_TITLE(planNumber) };
    }

    if (title.length > INSTALLMENT_PLAN_TITLE_MAX_LENGTH) {
      return {
        ok: false,
        message: INSTALLMENT_UI.PROGRAM_MODAL_ERROR_PLAN_TITLE_MAX(
          planNumber,
          INSTALLMENT_PLAN_TITLE_MAX_LENGTH,
        ),
      };
    }

    const monthsCount = Math.floor(Number(plan.monthsCount));
    if (
      !Number.isFinite(monthsCount) ||
      monthsCount < INSTALLMENT_MONTHS_MIN ||
      monthsCount > INSTALLMENT_MONTHS_MAX
    ) {
      return {
        ok: false,
        message: INSTALLMENT_UI.PROGRAM_MODAL_ERROR_PLAN_MONTHS(
          planNumber,
          INSTALLMENT_MONTHS_MIN,
          INSTALLMENT_MONTHS_MAX,
        ),
      };
    }

    const monthlyAmountRub = Math.floor(Number(plan.monthlyAmountRub));
    if (
      !Number.isFinite(monthlyAmountRub) ||
      monthlyAmountRub < INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB
    ) {
      return {
        ok: false,
        message: INSTALLMENT_UI.PROGRAM_MODAL_ERROR_PLAN_MONTHLY(
          planNumber,
          INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB,
        ),
      };
    }
  }

  return { ok: true };
};
