import { useId } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import {
  PRODUCT_CARD_PROMOTION_TIER,
  type ProductCardPromotionTier,
} from "@/entities/product/lib/productCardPromotionFramePalette";
import {
  PRODUCT_CARD_PROMOTION_RIBBON_LAYOUT,
  resolveProductCardPromotionRibbonGradient,
} from "@/entities/product/lib/productCardPromotionRibbonLayout";
import { PRODUCT_CARD_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { AppText } from "@/shared/ui/AppText";

const L = PRODUCT_CARD_PROMOTION_RIBBON_LAYOUT;

const TIER_LABEL: Record<ProductCardPromotionTier, string> = {
  [PRODUCT_CARD_PROMOTION_TIER.GOLD]: PRODUCT_CARD_UI.PROMOTED_BADGE,
  [PRODUCT_CARD_PROMOTION_TIER.TOP]: PRODUCT_CARD_UI.PROMOTION_TOP_BADGE,
  [PRODUCT_CARD_PROMOTION_TIER.BANNER]: PRODUCT_CARD_UI.PROMOTION_BANNER_BADGE,
};

type ProductCardPromotionCornerFlagProps = {
  tier: ProductCardPromotionTier;
  /** Смещение от левого края imageWrap; компенсирует negative margin bleed. */
  insetLeft?: number;
};

/**
 * Угловая плашка «БУСТ» / «ТОП» / «БАННЕР» — паритет web `.product-card__promotion-ribbon`.
 */
export const ProductCardPromotionCornerFlag = ({
  tier,
  insetLeft = L.insetLeft,
}: ProductCardPromotionCornerFlagProps) => {
  const theme = useAppTheme();
  const gradientId = useId().replace(/:/g, "");
  const label = TIER_LABEL[tier];
  const gradient = resolveProductCardPromotionRibbonGradient(tier, theme.colors);
  const letterSpacing = L.fontSize * L.letterSpacingEm;
  const lineHeight = L.fontSize * L.lineHeightRatio;

  return (
    <View
      style={[
        styles.shell,
        {
          left: insetLeft,
          borderBottomRightRadius: L.borderBottomRightRadius,
          shadowColor: theme.colors.text,
          ...(Platform.OS === "android"
            ? { elevation: 2 }
            : {
                shadowOffset: { width: 0, height: L.shadowOffsetY },
                shadowOpacity: 0.08,
                shadowRadius: L.shadowRadius,
              }),
        },
      ]}
      pointerEvents="none"
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <View
        style={[
          styles.gradientClip,
          { borderBottomRightRadius: L.borderBottomRightRadius },
        ]}
      >
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0">
              <Stop offset="0" stopColor={gradient.start} />
              <Stop offset="1" stopColor={gradient.end} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
        </Svg>
      </View>
      <AppText
        style={[
          styles.text,
          {
            color: theme.colors.onContrast,
            fontSize: L.fontSize,
            lineHeight,
            letterSpacing,
          },
        ]}
      >
        {label.toUpperCase()}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    position: "absolute",
    top: L.insetTop,
    zIndex: L.zIndex,
    overflow: "hidden",
    paddingTop: L.paddingTop,
    paddingRight: L.paddingRight,
    paddingBottom: L.paddingBottom,
    paddingLeft: L.paddingLeft,
  },
  gradientClip: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  text: {
    fontWeight: L.fontWeight,
  },
});
