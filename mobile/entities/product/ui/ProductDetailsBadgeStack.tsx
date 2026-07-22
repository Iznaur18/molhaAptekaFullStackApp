import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Text, View } from "react-native";

import {
  buildProductDetailsBadgeItems,
  type ProductDetailsBadgeItem,
} from "@/entities/product/lib/buildProductDetailsBadgeItems";
import {
  PRODUCT_DETAILS_BADGE_SOFT_COLORS,
  PRODUCT_DETAILS_SOFT_BADGE_LAYOUT,
} from "@/entities/product/lib/productDetailsBadgeSoftPalette";
import { PRODUCT_DETAILS_MODAL_UI } from "@/shared/config";
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
}: {
  item: ProductDetailsBadgeItem;
  styles: ReturnType<typeof useProductDetailScreenStyles>;
}) => {
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
};

export const ProductDetailsBadgeStack = ({ product }: ProductDetailsBadgeStackProps) => {
  const styles = useProductDetailScreenStyles();
  const items = buildProductDetailsBadgeItems({ product });

  return (
    <View style={[styles.priceBadgeRow, styles.priceBadgeRowContent]}>
      {items.map((item) => renderBadge({ item, styles }))}
    </View>
  );
};
