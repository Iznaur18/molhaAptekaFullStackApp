import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, ScrollView, Text, View } from "react-native";

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
  onBadgePress?: (item: ProductDetailsBadgeItem) => void;
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
  onBadgePress,
}: {
  item: ProductDetailsBadgeItem;
  styles: ReturnType<typeof useProductDetailScreenStyles>;
  theme: ReturnType<typeof useAppTheme>;
  onBadgePress?: (item: ProductDetailsBadgeItem) => void;
}) => {
  const interactive = typeof onBadgePress === "function";
  const Wrapper = interactive ? Pressable : View;
  const wrapperProps = interactive
    ? {
        accessibilityRole: "button" as const,
        onPress: () => onBadgePress?.(item),
      }
    : {};

  if (item.kind === "original") {
    return (
      <Wrapper
        key={item.key}
        style={[
          styles.metaInfoChip,
          styles.metaInfoChipRow,
          styles.metaInfoChipOriginal,
          softBadgeChrome,
        ]}
        accessibilityLabel={PRODUCT_DETAILS_MODAL_UI.ORIGINAL_BADGE_ARIA}
        {...wrapperProps}
      >
        <MaterialIcons name="check-circle" size={14} color={theme.colors.success} />
        <Text
          style={[softBadgeText, styles.metaInfoChipOriginalText]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </Wrapper>
    );
  }

  if (item.kind === "raffle") {
    const tone = PRODUCT_DETAILS_BADGE_SOFT_COLORS.raffle;
    return (
      <Wrapper
        key={item.key}
        style={[softBadgeChrome, { backgroundColor: tone.backgroundColor }]}
        accessibilityRole={interactive ? "button" : "text"}
        accessibilityLabel={item.label}
        {...wrapperProps}
      >
        <AppText style={[softBadgeText, { color: tone.color }]}>{item.label}</AppText>
      </Wrapper>
    );
  }

  if (item.kind === "affiliate") {
    const tone = PRODUCT_DETAILS_BADGE_SOFT_COLORS.affiliate;
    return (
      <Wrapper
        key={item.key}
        style={[softBadgeChrome, { backgroundColor: tone.backgroundColor }]}
        accessibilityRole={interactive ? "button" : "text"}
        accessibilityLabel={item.label}
        {...wrapperProps}
      >
        <AppText style={[softBadgeText, { color: tone.color }]}>{item.label}</AppText>
      </Wrapper>
    );
  }

  if (item.kind === "listingOrigin") {
    const tone = PRODUCT_DETAILS_BADGE_SOFT_COLORS.listingOrigin;
    return (
      <Wrapper
        key={item.key}
        style={[
          styles.metaInfoChip,
          styles.metaInfoChipRow,
          softBadgeChrome,
          { backgroundColor: tone.backgroundColor },
        ]}
        accessibilityLabel={PRODUCT_DETAILS_MODAL_UI.LISTING_ORIGIN_SLOT_ARIA}
        {...wrapperProps}
      >
        <MaterialIcons name={item.iconName} size={14} color={tone.color} />
        <Text style={[softBadgeText, { color: tone.color }]} numberOfLines={1}>
          {item.label}
        </Text>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      key={item.key}
      style={[
        styles.metaInfoChip,
        styles.metaInfoChipRow,
        softBadgeChrome,
        { backgroundColor: item.backgroundColor },
      ]}
      accessibilityLabel={PRODUCT_DETAILS_MODAL_UI.PRICE_MARKET_STATUS_SLOT_ARIA}
      {...wrapperProps}
    >
      <MaterialIcons name="sell" size={14} color={item.color} />
      <Text style={[softBadgeText, { color: item.color }]} numberOfLines={1}>
        {item.label}
      </Text>
    </Wrapper>
  );
};

export const ProductDetailsBadgeStack = ({
  product,
  onBadgePress,
}: ProductDetailsBadgeStackProps) => {
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
        {items.map((item) =>
          renderBadge({ item, styles, theme, onBadgePress }),
        )}
      </ScrollView>
    </View>
  );
};
