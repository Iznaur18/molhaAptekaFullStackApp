import { Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";

import type { ProductCompactCardFeatureBadgeVariant } from "@/entities/product/lib/buildMyProductCompactCardFeatureBadges";
import { useProductCompactCardStyles } from "@/shared/theme/productCompactCardStyles";

type ProductCompactCardStatusPillProps = {
  label: string;
  variant: ProductCompactCardFeatureBadgeVariant;
};

const resolveFeaturePillStyles = (
  styles: ReturnType<typeof useProductCompactCardStyles>,
  variant: ProductCompactCardFeatureBadgeVariant,
): { pill: StyleProp<ViewStyle>; text: StyleProp<TextStyle> } => {
  switch (variant) {
    case "auction":
      return { pill: styles.featurePillAuction, text: styles.featurePillTextAuction };
    case "installment":
      return { pill: styles.featurePillInstallment, text: styles.featurePillTextInstallment };
    case "raffle":
      return { pill: styles.featurePillRaffle, text: styles.featurePillTextRaffle };
    case "hidden":
      return { pill: styles.featurePillHidden, text: styles.featurePillTextHidden };
    case "loyaltyOvercommit":
      return {
        pill: styles.featurePillLoyaltyOvercommit,
        text: styles.featurePillTextLoyaltyOvercommit,
      };
    default:
      return { pill: null, text: styles.featurePillText };
  }
};

export const ProductCompactCardStatusPill = ({
  label,
  variant,
}: ProductCompactCardStatusPillProps) => {
  const styles = useProductCompactCardStyles();
  const featureStyles = resolveFeaturePillStyles(styles, variant);

  return (
    <View style={[styles.featurePill, featureStyles.pill]}>
      <Text style={[styles.featurePillText, featureStyles.text]}>{label}</Text>
    </View>
  );
};
