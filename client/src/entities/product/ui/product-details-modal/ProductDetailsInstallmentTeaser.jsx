import {
  resolveInstallmentPlanMonthlyAmountRub,
  resolveLastInstallmentPlan,
} from "../../../installment/lib/resolveLastInstallmentPlan.js";
import { useProductInstallmentProgramQuery } from "../../../installment/model/useProductInstallmentProgramQuery.js";
import { INSTALLMENT_UI } from "../../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../../shared/lib/formatPriceRub.js";
import { ProductDetailsTeaser } from "./ProductDetailsTeaser.jsx";

/**
 * @param {{
 *   productId: string;
 *   installmentEnabled: boolean;
 *   onPress: () => void;
 * }} props
 */
export function ProductDetailsInstallmentTeaser({
  productId,
  installmentEnabled,
  onPress,
}) {
  const programQuery = useProductInstallmentProgramQuery({
    productId,
    enabled: installmentEnabled,
  });

  if (!installmentEnabled) {
    return null;
  }

  const lastPlan = resolveLastInstallmentPlan(programQuery.data?.plans);
  const monthlyAmountRub = resolveInstallmentPlanMonthlyAmountRub(lastPlan);
  if (monthlyAmountRub == null) {
    return null;
  }

  return (
    <ProductDetailsTeaser
      title={INSTALLMENT_UI.DETAILS_TEASER_TITLE}
      subtitle={INSTALLMENT_UI.DETAILS_TEASER_FROM_MONTHLY(formatPriceRub(monthlyAmountRub))}
      goLabel={INSTALLMENT_UI.DETAILS_TEASER_GO}
      ariaLabel={INSTALLMENT_UI.DETAILS_TEASER_ARIA}
      onClick={onPress}
    />
  );
}
