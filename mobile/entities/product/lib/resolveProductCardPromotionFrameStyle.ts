import {
  PRODUCT_CARD_PREMIUM_ONLY_FRAME,
  PRODUCT_CARD_PROMOTION_BANNER_INNER_FRAME,
  PRODUCT_CARD_PROMOTION_COMPACT_FRAME,
  PRODUCT_CARD_PROMOTION_PREMIUM_COMPACT_FRAME,
  type ProductCardPromotionTier,
} from "./productCardPromotionFramePalette";

type PromotionFrameVariant = "compact" | "banner-outer" | "banner-inner";

type ResolveProductCardPromotionFrameOptions = {
  isPremium?: boolean;
};

export const resolveProductCardPromotionFrameStyle = (
  tier: ProductCardPromotionTier | null,
  variant: PromotionFrameVariant = "compact",
  { isPremium = false }: ResolveProductCardPromotionFrameOptions = {},
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

  if (tier == null) {
    if (!isPremium) {
      return null;
    }

    return {
      borderWidth: PRODUCT_CARD_PREMIUM_ONLY_FRAME.borderWidth,
      borderColor: PRODUCT_CARD_PREMIUM_ONLY_FRAME.borderColor,
      backgroundColor: PRODUCT_CARD_PREMIUM_ONLY_FRAME.backgroundColor,
      shadowColor: PRODUCT_CARD_PREMIUM_ONLY_FRAME.shadowColor,
      shadowOpacity: PRODUCT_CARD_PREMIUM_ONLY_FRAME.shadowOpacity,
      shadowRadius: PRODUCT_CARD_PREMIUM_ONLY_FRAME.shadowRadius,
      shadowOffset: { width: 0, height: PRODUCT_CARD_PREMIUM_ONLY_FRAME.shadowOffsetY },
      elevation: PRODUCT_CARD_PREMIUM_ONLY_FRAME.elevation,
    } as const;
  }

  const palette = isPremium
    ? PRODUCT_CARD_PROMOTION_PREMIUM_COMPACT_FRAME[tier]
    : PRODUCT_CARD_PROMOTION_COMPACT_FRAME[tier];

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
