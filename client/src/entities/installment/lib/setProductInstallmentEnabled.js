import {
  fetchProductInstallmentProgram,
  upsertProductInstallmentProgram,
} from "../api/installmentApi.js";

/**
 * @param {unknown} plans
 * @returns {Array<{ title: string; monthsCount: number; monthlyAmountRub: number; firstPaymentRequiredNow: boolean }>}
 */
const mapPlansForUpsert = (plans) => {
  if (!Array.isArray(plans)) {
    return [];
  }
  return plans.map((plan) => ({
    title: String(plan?.title ?? "").trim() || "Стандарт",
    monthsCount: Math.floor(Number(plan?.monthsCount) || 0),
    monthlyAmountRub: Math.floor(Number(plan?.monthlyAmountRub) || 0),
    firstPaymentRequiredNow: plan?.firstPaymentRequiredNow !== false,
  }));
};

/**
 * Вкл/выкл рассрочки без открытия модалки (нужны уже сохранённые планы).
 *
 * @param {string} productId
 * @param {boolean} enabled
 * @returns {Promise<{ needsSetup?: boolean; productInstallmentEnabled?: boolean }>}
 */
export async function setProductInstallmentEnabled(productId, enabled) {
  const program = await fetchProductInstallmentProgram(productId);
  const plans = mapPlansForUpsert(program?.plans);

  if (enabled && plans.length === 0) {
    return { needsSetup: true };
  }

  if (!enabled && plans.length === 0) {
    return { productInstallmentEnabled: false };
  }

  await upsertProductInstallmentProgram(productId, {
    isEnabled: enabled,
    plans,
  });

  return { productInstallmentEnabled: enabled };
}
