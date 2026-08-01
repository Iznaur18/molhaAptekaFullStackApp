import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { getProductPurchaseLimit } from "@/entities/product/lib/getProductPurchaseLimit";
import { isProductOnSale } from "@/entities/product/lib/isProductOnSale";
import { PRODUCT_SALE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductDetailScreenStyles } from "@/shared/theme/catalogProductStyles";

type ProductDetailsSaleTeaserProps = {
  product: Record<string, unknown>;
  sellerId: string;
};

export const ProductDetailsSaleTeaser = ({
  product,
  sellerId,
}: ProductDetailsSaleTeaserProps) => {
  const theme = useAppTheme();
  const styles = useProductDetailScreenStyles();
  const router = useRouter();
  const trimmedSellerId = sellerId.trim();

  if (!isProductOnSale(product) || trimmedSellerId.length === 0) {
    return null;
  }

  const remainingCount = getProductPurchaseLimit(product);

  const handlePress = () => {
    router.push({ pathname: "/seller/[userId]", params: { userId: trimmedSellerId } });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.featureCard,
        pressed ? { opacity: 0.92, borderColor: theme.colors.actionBorder } : null,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={PRODUCT_SALE_UI.DETAILS_TEASER_ARIA}
    >
      <View style={styles.featureCardIcon}>
        <MaterialIcons name="local-offer" size={20} color={theme.colors.action} />
      </View>
      <View style={styles.featureCardText}>
        <Text style={styles.featureCardTitle}>{PRODUCT_SALE_UI.DETAILS_TEASER_TITLE}</Text>
        <Text style={styles.featureCardSubtitle}>
          {PRODUCT_SALE_UI.DETAILS_TEASER_REMAINING(remainingCount)}
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
