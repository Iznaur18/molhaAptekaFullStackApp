import { Text, View } from "react-native";

import { formatProductReviewRatingLine } from "@/entities/product-review/lib/formatProductReviewRatingLine";
import { resolveProductReviewSummaryPalette } from "@/entities/product-review/lib/productReviewSummaryPalette";
import {
  buildProductReviewSummaryCardStyle,
  ProductReviewSummaryBackground,
} from "@/entities/product-review/ui/ProductReviewSummaryBackground";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { useProductDetailTabStyles } from "@/shared/theme/catalogProductStyles";

const STAR_VALUES = [1, 2, 3, 4, 5] as const;
const SUMMARY_BORDER_RADIUS = 20;

type ProductReviewSummaryProps = {
  averageRating: number;
  reviewCount: number;
};

const formatReviewCountLabel = (count: number): string => {
  if (count === 1) {
    return "1 отзыв";
  }
  if (count < 5) {
    return `${count} отзыва`;
  }
  return `${count} отзывов`;
};

export const ProductReviewSummary = ({
  averageRating,
  reviewCount,
}: ProductReviewSummaryProps) => {
  const styles = useProductDetailTabStyles();
  const { colorScheme } = useAppThemeSettings();
  const palette = resolveProductReviewSummaryPalette(colorScheme);

  if (reviewCount <= 0) {
    return null;
  }

  const avg = Number(averageRating) || 0;
  const displayRating = Math.round(avg * 10) / 10;
  const displayRatingLabel =
    displayRating % 1 === 0 ? String(displayRating) : displayRating.toFixed(1);
  const starsValue = Math.min(5, Math.max(0, Math.round(avg)));
  const ratingLine = formatProductReviewRatingLine(avg, reviewCount);

  return (
    <View
      style={[
        styles.summaryCard,
        buildProductReviewSummaryCardStyle(palette, colorScheme),
        { borderColor: palette.border },
      ]}
      accessibilityLabel={ratingLine}
    >
      <ProductReviewSummaryBackground
        borderRadius={SUMMARY_BORDER_RADIUS}
        palette={palette}
      />
      <View style={styles.summaryCardContent}>
        <Text style={styles.summaryScore} accessible={false}>
          {displayRatingLabel}
        </Text>
        <View style={styles.summaryMeta}>
          <View style={styles.summaryStars}>
            {STAR_VALUES.map((value) => (
              <Text
                key={value}
                style={[
                  styles.summaryStarChar,
                  value <= starsValue
                    ? [styles.summaryStarFilled, { color: palette.starFilled }]
                    : styles.itemStarMuted,
                ]}
              >
                ★
              </Text>
            ))}
          </View>
          <Text style={styles.summaryCount}>{formatReviewCountLabel(reviewCount)}</Text>
        </View>
      </View>
    </View>
  );
};
