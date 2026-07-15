import type { IzTheme } from "@izibuy/design-tokens";

import {
  resolveProductCardPremiumOnlyFrame,
  resolveProductCardPromotionBannerInnerFrame,
  resolveProductCardPromotionCompactFrame,
  resolveProductCardPromotionPremiumCompactFrame,
  resolveProductCardSoftElevationShadow,
  type ProductCardPromotionTier,
} from "./productCardPromotionFramePalette";

type ThemeColors = IzTheme["colors"];
type PromotionFrameVariant = "compact" | "banner-outer" | "banner-inner";

type ResolveProductCardPromotionFrameOptions = {
  isPremium?: boolean;
  colors: ThemeColors;
};

const withProductCardPremiumSoftElevationFrame = (
  colors: ThemeColors,
  frameStyle: {
    backgroundColor?: string;
  } = {},
) => {
  const soft = resolveProductCardSoftElevationShadow(colors);
  return {
    borderWidth: 0,
    backgroundColor: frameStyle.backgroundColor,
    shadowColor: soft.shadowColor,
    shadowOpacity: soft.shadowOpacity,
    shadowRadius: soft.shadowRadius,
    shadowOffset: { width: 0, height: soft.shadowOffsetY },
    elevation: soft.elevation,
  } as const;
};

export const resolveProductCardPromotionFrameStyle = (
  tier: ProductCardPromotionTier | null,
  variant: PromotionFrameVariant = "compact",
  { isPremium = false, colors }: ResolveProductCardPromotionFrameOptions,
) => {
  if (variant === "banner-inner") {
    const palette = resolveProductCardPromotionBannerInnerFrame(colors);

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

    const premiumOnly = resolveProductCardPremiumOnlyFrame(colors);
    return withProductCardPremiumSoftElevationFrame(colors, {
      backgroundColor: premiumOnly.backgroundColor,
    });
  }

  const palette = isPremium
    ? resolveProductCardPromotionPremiumCompactFrame(colors)[tier]
    : resolveProductCardPromotionCompactFrame(colors)[tier];

  if (isPremium) {
    return withProductCardPremiumSoftElevationFrame(colors, {
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
