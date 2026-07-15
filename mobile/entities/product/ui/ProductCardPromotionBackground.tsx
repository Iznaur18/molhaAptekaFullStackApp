import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import {
  resolveProductCardPromotionBannerInnerFrame,
  resolveProductCardPromotionCompactFrame,
  resolveProductCardPromotionPremiumCompactFrame,
  type ProductCardPromotionTier,
} from "@/entities/product/lib/productCardPromotionFramePalette";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type ProductCardPromotionBackgroundProps = {
  tier: ProductCardPromotionTier;
  variant?: "compact" | "banner-inner";
  isPremium?: boolean;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export const ProductCardPromotionBackground = ({
  tier,
  variant = "compact",
  isPremium = false,
  borderRadius = 14,
  style,
}: ProductCardPromotionBackgroundProps) => {
  const theme = useAppTheme();
  const gradientId = `productPromotion-${variant}-${tier}-${isPremium ? "premium" : "base"}`;

  if (variant === "banner-inner") {
    const palette = resolveProductCardPromotionBannerInnerFrame(theme.colors);

    return (
      <View style={[StyleSheet.absoluteFill, { borderRadius }, style]} pointerEvents="none">
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0.25">
              <Stop offset="0" stopColor={palette.gradientStart} />
              <Stop offset="0.52" stopColor={palette.gradientMid} />
              <Stop offset="1" stopColor={palette.gradientEnd} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" rx={borderRadius} fill={`url(#${gradientId})`} />
        </Svg>
      </View>
    );
  }

  const palette = isPremium
    ? resolveProductCardPromotionPremiumCompactFrame(theme.colors)[tier]
    : resolveProductCardPromotionCompactFrame(theme.colors)[tier];

  return (
    <View style={[StyleSheet.absoluteFill, { borderRadius }, style]} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0.25" y2="1">
            <Stop offset="0" stopColor={palette.gradientStart} />
            <Stop offset="1" stopColor={palette.gradientEnd} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" rx={borderRadius} fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
};
