import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScrollView, Text, View } from "react-native";

import {
  buildProductDetailsBadgeItems,
  type ProductDetailsBadgeItem,
} from "@/entities/product/lib/buildProductDetailsBadgeItems";
import {
  PRODUCT_DETAILS_BADGE_SOFT_COLORS,
  PRODUCT_DETAILS_SOFT_BADGE_LAYOUT,
} from "@/entities/product/lib/productDetailsBadgeSoftPalette";
import { PRODUCT_DETAILS_MODAL_UI } from "@/shared/config";
import { nestedHorizontalScrollProps } from "@/shared/lib/nestedHorizontalScrollProps";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductDetailScreenStyles } from "@/shared/theme/catalogProductStyles";
import { AppText } from "@/shared/ui/AppText";

type ProductDetailsBadgeStackProps = {
  product: Record<string, unknown>;
};

const softBadgeChrome = {
  paddingHorizontal: PRODUCT_DETAILS_SOFT_BADGE_LAYOUT.paddingHorizontal,
  paddingVertical: PRODUCT_DETAILS_SOFT_BADGE_LAYOUT.paddingVertical,
  borderRadius: PRODUCT_DETAILS_SOFT_BADGE_LAYOUT.borderRadius,
  borderWidth: 0,
  flexShrink: 0,
} as const;

const softBadgeText = {
  fontSize: PRODUCT_DETAILS_SOFT_BADGE_LAYOUT.fontSize,
  lineHeight: PRODUCT_DETAILS_SOFT_BADGE_LAYOUT.lineHeight,
  fontWeight: "800" as const,
};

const renderBadge = ({
  item,
  styles,
  theme,
}: {
  item: ProductDetailsBadgeItem;
  styles: ReturnType<typeof useProductDetailScreenStyles>;
  theme: ReturnType<typeof useAppTheme>;
}) => {
  if (item.kind === "original") {
    return (
      <View
        key={item.key}
        style={[
          styles.metaInfoChip,
          styles.metaInfoChipRow,
          styles.metaInfoChipOriginal,
          softBadgeChrome,
        ]}
        accessibilityLabel={PRODUCT_DETAILS_MODAL_UI.ORIGINAL_BADGE_ARIA}
      >
        <MaterialIcons name="check-circle" size={14} color={theme.colors.success} />
        <Text
          style={[softBadgeText, styles.metaInfoChipOriginalText]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </View>
    );
  }

  if (item.kind === "raffle") {
    const tone = PRODUCT_DETAILS_BADGE_SOFT_COLORS.raffle;
    return (
      <View
        key={item.key}
        style={[softBadgeChrome, { backgroundColor: tone.backgroundColor }]}
        accessibilityRole="text"
        accessibilityLabel={item.label}
      >
        <AppText style={[softBadgeText, { color: tone.color }]}>{item.label}</AppText>
      </View>
    );
  }

  if (item.kind === "listingOrigin") {
    const tone = PRODUCT_DETAILS_BADGE_SOFT_COLORS.listingOrigin;
    return (
      <View
        key={item.key}
        style={[
          styles.metaInfoChip,
          styles.metaInfoChipRow,
          softBadgeChrome,
          { backgroundColor: tone.backgroundColor },
        ]}
        accessibilityLabel={PRODUCT_DETAILS_MODAL_UI.LISTING_ORIGIN_SLOT_ARIA}
      >
        <MaterialIcons name={item.iconName} size={14} color={tone.color} />
        <Text style={[softBadgeText, { color: tone.color }]} numberOfLines={1}>
          {item.label}
        </Text>
      </View>
    );
  }

  return (
    <View
      key={item.key}
      style={[
        styles.metaInfoChip,
        styles.metaInfoChipRow,
        softBadgeChrome,
        { backgroundColor: item.backgroundColor },
      ]}
      accessibilityLabel={PRODUCT_DETAILS_MODAL_UI.PRICE_MARKET_STATUS_SLOT_ARIA}
    >
      <MaterialIcons name="sell" size={14} color={item.color} />
      <Text style={[softBadgeText, { color: item.color }]} numberOfLines={1}>
        {item.label}
      </Text>
    </View>
  );
};

export const ProductDetailsBadgeStack = ({ product }: ProductDetailsBadgeStackProps) => {
  const styles = useProductDetailScreenStyles();
  const theme = useAppTheme();
  const items = buildProductDetailsBadgeItems({ product });

  return (
    <View style={styles.priceBadgeRow}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.priceBadgeRowContent}
        {...nestedHorizontalScrollProps}
        keyboardShouldPersistTaps="handled"
      >
        {items.map((item) => renderBadge({ item, styles, theme }))}
      </ScrollView>
    </View>
  );
};
