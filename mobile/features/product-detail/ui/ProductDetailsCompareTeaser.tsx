import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Text, View } from "react-native";

import { useComparableProductsQuery } from "@/entities/product/model/useComparableProductsQuery";
import { PRODUCT_COMPARE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductDetailScreenStyles } from "@/shared/theme/catalogProductStyles";

type ProductDetailsCompareTeaserProps = {
  productId: string;
  enabled?: boolean;
  onPress: () => void;
};

/**
 * Порт `client/.../ProductDetailsCompareTeaser.jsx`: карточка появляется только
 * когда серверу реально есть что показать в сравнении.
 */
export const ProductDetailsCompareTeaser = ({
  productId,
  enabled = true,
  onPress,
}: ProductDetailsCompareTeaserProps) => {
  const theme = useAppTheme();
  const styles = useProductDetailScreenStyles();
  const compareQuery = useComparableProductsQuery({
    productId,
    enabled: enabled && String(productId ?? "").trim().length > 0,
  });

  if (!enabled || (compareQuery.data ?? []).length === 0) {
    return null;
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.featureCard,
        pressed ? { opacity: 0.92, borderColor: theme.colors.actionBorder } : null,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={PRODUCT_COMPARE_UI.DETAILS_TEASER_ARIA}
    >
      <View style={styles.featureCardIcon}>
        <MaterialIcons name="compare-arrows" size={20} color={theme.colors.action} />
      </View>
      <View style={styles.featureCardText}>
        <Text style={styles.featureCardTitle}>
          {PRODUCT_COMPARE_UI.DETAILS_TEASER_TITLE}
        </Text>
        <Text style={styles.featureCardSubtitle}>
          {PRODUCT_COMPARE_UI.DETAILS_TEASER_SUBTITLE}
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
