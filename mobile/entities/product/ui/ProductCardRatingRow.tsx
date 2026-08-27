import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Text, View } from "react-native";

import { PRODUCT_CARD_RATING_LAYOUT as RL } from "@/entities/product/lib/productCardRatingLayout";
import {
  formatProductReviewRatingLine,
  getProductReviewRatingParts,
} from "@/entities/product-review/lib/formatProductReviewRatingLine";
import { PRODUCT_REVIEW_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductCardRatingRowStyles } from "@/shared/theme/catalogProductStyles";

type ProductCardRatingRowProps = {
  averageRating?: unknown;
  reviewCount?: unknown;
  layout?: "default" | "catalog-grid";
};

export const ProductCardRatingRow = ({
  averageRating,
  reviewCount,
  layout = "default",
}: ProductCardRatingRowProps) => {
  const theme = useAppTheme();
  const styles = useProductCardRatingRowStyles();
  const parts = getProductReviewRatingParts(averageRating, reviewCount);
  const isCatalogGrid = layout === "catalog-grid";
  const iconSize = RL.iconSize;
  const iconColor = theme.colors.textMuted;
  const rootStyle = [
    styles.root,
    isCatalogGrid && styles.rootCatalogGrid,
    !parts && styles.rootPlaceholder,
  ];
  const textStyle = [
    styles.text,
    isCatalogGrid && styles.textCatalogGrid,
    !parts && styles.textPlaceholder,
  ];
  const accessibilityLabel = parts
    ? formatProductReviewRatingLine(averageRating, reviewCount)
    : PRODUCT_REVIEW_UI.NO_REVIEWS;

  if (!parts) {
    return (
      <Text
        style={[textStyle, styles.placeholderOnly]}
        numberOfLines={1}
        accessibilityRole="text"
        accessibilityLabel={accessibilityLabel}
      >
        {PRODUCT_REVIEW_UI.NO_REVIEWS}
      </Text>
    );
  }

  return (
    <View
      style={rootStyle}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={textStyle} numberOfLines={1} accessible={false}>
        ★ {parts.rating}
      </Text>
      <Text style={[textStyle, styles.sep]} accessible={false}>
        ·
      </Text>
      <View style={styles.countRow} accessible={false}>
        <MaterialIcons
          name="chat-bubble"
          size={iconSize}
          color={iconColor}
          style={styles.countIcon}
        />
        <Text style={textStyle} numberOfLines={1}>
          {parts.count}
        </Text>
      </View>
    </View>
  );
};
