import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import {
  PRODUCT_CARD_PROMOTION_BANNER_INNER_FRAME,
  PRODUCT_CARD_PROMOTION_COMPACT_FRAME,
  PRODUCT_CARD_PROMOTION_PREMIUM_COMPACT_FRAME,
  type ProductCardPromotionTier,
} from "@/entities/product/lib/productCardPromotionFramePalette";

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
  const gradientId = `productPromotion-${variant}-${tier}-${isPremium ? "premium" : "base"}`;

  if (variant === "banner-inner") {
    const palette = PRODUCT_CARD_PROMOTION_BANNER_INNER_FRAME;

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
    ? PRODUCT_CARD_PROMOTION_PREMIUM_COMPACT_FRAME[tier]
    : PRODUCT_CARD_PROMOTION_COMPACT_FRAME[tier];

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
