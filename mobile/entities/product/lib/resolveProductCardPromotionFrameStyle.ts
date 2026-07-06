import {
  PRODUCT_CARD_PREMIUM_ONLY_FRAME,
  PRODUCT_CARD_PROMOTION_BANNER_INNER_FRAME,
  PRODUCT_CARD_PROMOTION_COMPACT_FRAME,
  PRODUCT_CARD_PROMOTION_PREMIUM_COMPACT_FRAME,
  PRODUCT_CARD_SOFT_ELEVATION_SHADOW,
  type ProductCardPromotionTier,
} from "./productCardPromotionFramePalette";

type PromotionFrameVariant = "compact" | "banner-outer" | "banner-inner";

type ResolveProductCardPromotionFrameOptions = {
  isPremium?: boolean;
};

const withProductCardPremiumSoftElevationFrame = (
  frameStyle: {
    backgroundColor?: string;
  } = {},
) =>
  ({
    borderWidth: 0,
    backgroundColor: frameStyle.backgroundColor,
    shadowColor: PRODUCT_CARD_SOFT_ELEVATION_SHADOW.shadowColor,
    shadowOpacity: PRODUCT_CARD_SOFT_ELEVATION_SHADOW.shadowOpacity,
    shadowRadius: PRODUCT_CARD_SOFT_ELEVATION_SHADOW.shadowRadius,
    shadowOffset: { width: 0, height: PRODUCT_CARD_SOFT_ELEVATION_SHADOW.shadowOffsetY },
    elevation: PRODUCT_CARD_SOFT_ELEVATION_SHADOW.elevation,
  }) as const;

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

    return withProductCardPremiumSoftElevationFrame({
      backgroundColor: PRODUCT_CARD_PREMIUM_ONLY_FRAME.backgroundColor,
    });
  }

  const palette = isPremium
    ? PRODUCT_CARD_PROMOTION_PREMIUM_COMPACT_FRAME[tier]
    : PRODUCT_CARD_PROMOTION_COMPACT_FRAME[tier];

  if (isPremium) {
    return withProductCardPremiumSoftElevationFrame({
      backgroundColor: "transparent",
    });
  }

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
