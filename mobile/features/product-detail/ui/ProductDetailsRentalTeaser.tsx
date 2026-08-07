import {
  isProductRentalConfigured,
  PRODUCT_RENTAL_PRICE_UNIT_HOUR,
} from "@izibuy/shared-lib";
import { Pressable, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { PRODUCT_RENTAL_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductDetailScreenStyles } from "@/shared/theme/catalogProductStyles";

type ProductDetailsRentalTeaserProps = {
  product: Record<string, unknown>;
  onPress: () => void;
};

export const ProductDetailsRentalTeaser = ({
  product,
  onPress,
}: ProductDetailsRentalTeaserProps) => {
  const theme = useAppTheme();
  const styles = useProductDetailScreenStyles();

  if (
    product.productRentalEnabled !== true ||
    !isProductRentalConfigured(product)
  ) {
    return null;
  }

  const priceRub = Math.floor(Number(product.productRentalPriceRub));
  const priceLabel = formatPriceRub(priceRub);
  const subtitle =
    product.productRentalPriceUnit === PRODUCT_RENTAL_PRICE_UNIT_HOUR
      ? PRODUCT_RENTAL_UI.DETAILS_TEASER_PRICE_HOUR(priceLabel)
      : PRODUCT_RENTAL_UI.DETAILS_TEASER_PRICE_DAY(priceLabel);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.featureCard,
        pressed ? { opacity: 0.92, borderColor: theme.colors.actionBorder } : null,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={PRODUCT_RENTAL_UI.DETAILS_TEASER_ARIA}
    >
      <View style={styles.featureCardIcon}>
        <MaterialIcons name="vpn-key" size={20} color={theme.colors.action} />
      </View>
      <View style={styles.featureCardText}>
        <Text style={styles.featureCardTitle}>
          {PRODUCT_RENTAL_UI.DETAILS_TEASER_TITLE}
        </Text>
        <Text style={styles.featureCardSubtitle}>{subtitle}</Text>
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
