import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { resolveProductReviewSummaryPalette } from "@/entities/product-review/lib/productReviewSummaryPalette";
import type { ColorScheme } from "@izibuy/design-tokens";

type ProductReviewSummaryPalette = ReturnType<typeof resolveProductReviewSummaryPalette>;

const GRADIENT_SVG_ID = "productReviewSummaryGradient";

export const buildProductReviewSummaryCardStyle = (
  palette: ProductReviewSummaryPalette,
  colorScheme: ColorScheme,
): ViewStyle => {
  void colorScheme;

  if (Platform.OS === "web") {
    return {
      backgroundColor: palette.gradientStart,
      // RN Web maps backgroundImage → CSS background-image
      backgroundImage: `linear-gradient(145deg, ${palette.gradientStart} 0%, ${palette.gradientEnd} 100%)`,
    } as ViewStyle;
  }

  return {
    backgroundColor: palette.gradientStart,
  };
};

type ProductReviewSummaryBackgroundProps = {
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  palette: ProductReviewSummaryPalette;
};

export const ProductReviewSummaryBackground = ({
  borderRadius = 20,
  style,
  palette,
}: ProductReviewSummaryBackgroundProps) => {
  if (Platform.OS === "web") {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFill, { borderRadius }, style]} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={GRADIENT_SVG_ID} x1="0" y1="0" x2="0.72" y2="1">
            <Stop offset="0" stopColor={palette.gradientStart} />
            <Stop offset="1" stopColor={palette.gradientEnd} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" rx={borderRadius} fill={`url(#${GRADIENT_SVG_ID})`} />
      </Svg>
    </View>
  );
};
