import type { IzTheme } from "@izibuy/design-tokens";

import {
  PRODUCT_CARD_PROMOTION_TIER,
  type ProductCardPromotionTier,
} from "@/entities/product/lib/productCardPromotionFramePalette";
import { mixHexColors } from "@/shared/lib/mixHexColors";

type ThemeColors = IzTheme["colors"];

/** Паритет `client/.../product-card/ProductCardMedia.css` (.product-card__promotion-ribbon). */
export const PRODUCT_CARD_PROMOTION_RIBBON_LAYOUT = {
  insetTop: 0,
  insetLeft: 0,
  zIndex: 2,
  paddingTop: 4.48,
  paddingRight: 11.2,
  paddingBottom: 5.12,
  paddingLeft: 9.92,
  borderBottomRightRadius: 12,
  fontSize: 10.88,
  fontWeight: "800" as const,
  letterSpacingEm: 0.08,
  lineHeightRatio: 1.2,
  shadowOffsetY: 2,
  shadowRadius: 8,
  shadowOpacity: 1,
  gradientMixRatio: 0.78,
} as const;

export type ProductCardPromotionRibbonGradient = {
  start: string;
  end: string;
};

/** color-mix(in srgb, accent 78%, soft) → accent, как tier-* в ProductCardMedia.css */
export const resolveProductCardPromotionRibbonGradient = (
  tier: ProductCardPromotionTier,
  colors: ThemeColors,
): ProductCardPromotionRibbonGradient => {
  const mix = PRODUCT_CARD_PROMOTION_RIBBON_LAYOUT.gradientMixRatio;

  switch (tier) {
    case PRODUCT_CARD_PROMOTION_TIER.GOLD:
      return {
        start: mixHexColors(colors.warning, colors.warningSurface, mix),
        end: colors.warning,
      };
    case PRODUCT_CARD_PROMOTION_TIER.TOP:
      return {
        start: mixHexColors(colors.accent, colors.accentSoft, mix),
        end: colors.accent,
      };
    case PRODUCT_CARD_PROMOTION_TIER.BANNER:
      return {
        start: mixHexColors(colors.danger, colors.surface, mix),
        end: colors.danger,
      };
    default:
      return {
        start: mixHexColors(colors.warning, colors.warningSurface, mix),
        end: colors.warning,
      };
  }
};
