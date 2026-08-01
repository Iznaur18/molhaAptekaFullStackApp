import { Pressable, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import {
  resolveInstallmentPlanMonthlyAmountRub,
  resolveLastInstallmentPlan,
} from "@/entities/installment/lib/resolveLastInstallmentPlan";
import { useProductInstallmentProgramQuery } from "@/entities/installment/model/useProductInstallmentProgramQuery";
import { INSTALLMENT_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
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
  const theme = useAppTheme();
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
      style={({ pressed }) => [
        styles.featureCard,
        pressed ? { opacity: 0.92, borderColor: theme.colors.actionBorder } : null,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={INSTALLMENT_UI.DETAILS_TEASER_ARIA}
    >
      <View style={styles.featureCardIcon}>
        <MaterialIcons name="credit-card" size={20} color={theme.colors.action} />
      </View>
      <View style={styles.featureCardText}>
        <Text style={styles.featureCardTitle}>{INSTALLMENT_UI.DETAILS_TEASER_TITLE}</Text>
        <Text style={styles.featureCardSubtitle}>
          {INSTALLMENT_UI.DETAILS_TEASER_FROM_MONTHLY(monthlyLabel)}
        </Text>
      </View>
      <MaterialIcons
        name="chevron-right"
        size={22}
        color={theme.colors.action}
        style={styles.featureCardChevron}
      />
    </Pressable>
  );
};
