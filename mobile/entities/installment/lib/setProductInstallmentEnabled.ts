import {
  fetchProductInstallmentProgram,
  upsertProductInstallmentProgram,
} from "../api/installmentApi";

type InstallmentPlanLike = {
  title?: string | null;
  monthsCount?: number | null;
  monthlyAmountRub?: number | null;
  firstPaymentRequiredNow?: boolean | null;
};

const mapPlansForUpsert = (plans: unknown) => {
  if (!Array.isArray(plans)) {
    return [];
  }
  return (plans as InstallmentPlanLike[]).map((plan) => ({
    title: String(plan?.title ?? "").trim() || "Стандарт",
    monthsCount: Math.floor(Number(plan?.monthsCount) || 0),
    monthlyAmountRub: Math.floor(Number(plan?.monthlyAmountRub) || 0),
    firstPaymentRequiredNow: plan?.firstPaymentRequiredNow !== false,
  }));
};

export const setProductInstallmentEnabled = async (
  productId: string,
  enabled: boolean,
): Promise<{ needsSetup?: boolean; productInstallmentEnabled?: boolean }> => {
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
};
