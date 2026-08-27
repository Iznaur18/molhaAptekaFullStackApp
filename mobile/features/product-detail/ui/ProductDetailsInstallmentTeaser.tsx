import { CreditCard } from "@/shared/ui/productDetailsLucideIcons";

import {
  resolveInstallmentPlanMonthlyAmountRub,
  resolveLastInstallmentPlan,
} from "@/entities/installment/lib/resolveLastInstallmentPlan";
import { useProductInstallmentProgramQuery } from "@/entities/installment/model/useProductInstallmentProgramQuery";
import { INSTALLMENT_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";

import { ProductDetailsFeatureCard } from "@/entities/product/ui/ProductDetailsFeatureCard";

type ProductDetailsInstallmentTeaserProps = {
  productId: string;
  installmentEnabled: boolean;
  onPress: () => void;
};

export const ProductDetailsInstallmentTeaser = ({
  productId,
  installmentEnabled,
  onPress,
}: ProductDetailsInstallmentTeaserProps) => {
  const programQuery = useProductInstallmentProgramQuery(productId, installmentEnabled);

  if (!installmentEnabled) {
    return null;
  }

  const lastPlan = resolveLastInstallmentPlan(programQuery.data?.plans);
  const monthlyAmountRub = resolveInstallmentPlanMonthlyAmountRub(lastPlan);

  if (monthlyAmountRub == null) {
    return null;
  }

  const monthlyLabel = formatPriceRub(monthlyAmountRub);

  return (
    <ProductDetailsFeatureCard
      icon={CreditCard}
      title={INSTALLMENT_UI.DETAILS_TEASER_TITLE}
      subtitle={INSTALLMENT_UI.DETAILS_TEASER_FROM_MONTHLY(monthlyLabel)}
      ariaLabel={INSTALLMENT_UI.DETAILS_TEASER_ARIA}
      onPress={onPress}
    />
  );
};
