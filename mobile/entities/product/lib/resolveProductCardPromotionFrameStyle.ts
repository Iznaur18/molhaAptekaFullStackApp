import {
  PRODUCT_CARD_PROMOTION_BANNER_INNER_FRAME,
  PRODUCT_CARD_PROMOTION_COMPACT_FRAME,
  type ProductCardPromotionTier,
} from "./productCardPromotionFramePalette";

type PromotionFrameVariant = "compact" | "banner-outer" | "banner-inner";

export const resolveProductCardPromotionFrameStyle = (
  tier: ProductCardPromotionTier,
  variant: PromotionFrameVariant = "compact",
) => {
  if (variant === "banner-inner") {
    const palette = PRODUCT_CARD_PROMOTION_BANNER_INNER_FRAME;

    return {
      borderWidth: palette.borderWidth,
      borderColor: palette.borderColor,
      backgroundColor: "transparent",
      shadowColor: palette.shadowColor,
      shadowOpacity: palette.shadowOpacity,
      shadowRadius: palette.shadowRadius,
      shadowOffset: { width: 0, height: palette.shadowOffsetY },
      elevation: palette.elevation,
    } as const;
  }

  const palette = PRODUCT_CARD_PROMOTION_COMPACT_FRAME[tier];

  return {
    borderWidth: palette.borderWidth,
    borderColor: palette.borderColor,
    backgroundColor: "transparent",
    shadowColor: palette.shadowColor,
    shadowOpacity: palette.shadowOpacity,
    shadowRadius: palette.shadowRadius,
    shadowOffset: { width: 0, height: palette.shadowOffsetY },
    elevation: palette.elevation,
  } as const;
};
