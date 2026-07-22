import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Text, View } from "react-native";

import { isProductOriginalBadgeVisible } from "@/entities/product/lib/productIsOriginal";
import { resolveProductPriceMarketStatusPresentation } from "@/entities/product/lib/productPriceMarketStatus";
import { PRODUCT_DETAILS_MODAL_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductDetailScreenStyles } from "@/shared/theme/catalogProductStyles";

type ProductDetailsAboveNameChipsProps = {
  product: Record<string, unknown>;
};

export const ProductDetailsAboveNameChips = ({
  product,
}: ProductDetailsAboveNameChipsProps) => {
  const styles = useProductDetailScreenStyles();
  const theme = useAppTheme();
  const showOriginal = isProductOriginalBadgeVisible(product.productIsOriginal);
  const priceMarket = resolveProductPriceMarketStatusPresentation(
    product.productPriceMarketStatus,
  );

  return (
    <View style={styles.aboveNameChipRow}>
      {showOriginal ? (
        <View
          style={[styles.metaInfoChip, styles.metaInfoChipOriginal]}
          accessibilityLabel={PRODUCT_DETAILS_MODAL_UI.ORIGINAL_BADGE_ARIA}
        >
          <View style={styles.metaInfoChipRow}>
            <MaterialIcons name="check-circle" size={14} color={theme.colors.success} />
            <Text
              style={[styles.metaInfoChipText, styles.metaInfoChipOriginalText]}
              numberOfLines={1}
            >
              {PRODUCT_DETAILS_MODAL_UI.ORIGINAL_BADGE}
            </Text>
          </View>
        </View>
      ) : null}
      <View
        style={[
          styles.metaInfoChip,
          styles.metaInfoChipRow,
          {
            backgroundColor: priceMarket.backgroundColor,
          },
        ]}
        accessibilityLabel={PRODUCT_DETAILS_MODAL_UI.PRICE_MARKET_STATUS_SLOT_ARIA}
      >
        <MaterialIcons name="sell" size={14} color={priceMarket.color} />
        <Text style={[styles.metaInfoChipText, { color: priceMarket.color }]} numberOfLines={1}>
          {priceMarket.label}
        </Text>
      </View>
    </View>
  );
};
