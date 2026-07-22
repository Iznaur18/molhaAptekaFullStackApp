import { Pressable, Text, View } from "react-native";

import {
  resolveInstallmentPlanMonthlyAmountRub,
  resolveLastInstallmentPlan,
} from "@/entities/installment/lib/resolveLastInstallmentPlan";
import { useProductInstallmentProgramQuery } from "@/entities/installment/model/useProductInstallmentProgramQuery";
import { INSTALLMENT_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useProductDetailScreenStyles } from "@/shared/theme/catalogProductStyles";

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
  const styles = useProductDetailScreenStyles();
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
    <Pressable
      style={styles.installmentTeaser}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={INSTALLMENT_UI.DETAILS_TEASER_ARIA}
    >
      <View style={styles.installmentTeaserCopy}>
        <Text style={styles.installmentTeaserTitle}>{INSTALLMENT_UI.DETAILS_TEASER_TITLE}</Text>
        <Text style={styles.installmentTeaserMonthly}>
          {INSTALLMENT_UI.DETAILS_TEASER_FROM_MONTHLY(monthlyLabel)}
        </Text>
      </View>
      <View style={styles.installmentTeaserGo}>
        <Text style={styles.installmentTeaserGoText}>{INSTALLMENT_UI.DETAILS_TEASER_GO}</Text>
      </View>
    </Pressable>
  );
};
