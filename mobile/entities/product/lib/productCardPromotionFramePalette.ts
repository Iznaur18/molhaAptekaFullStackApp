import { izColors, type IzTheme } from "@izibuy/design-tokens";

type ThemeColors = IzTheme["colors"];

/** Синхронизировано с client ProductCardFrame.css + designTokens.css */
export const PRODUCT_CARD_PROMOTION_TIER = {
  GOLD: 1,
  TOP: 2,
  BANNER: 3,
} as const;

export type ProductCardPromotionTier =
  (typeof PRODUCT_CARD_PROMOTION_TIER)[keyof typeof PRODUCT_CARD_PROMOTION_TIER];

/** Паритет с ProductCardFrame.css — нейтральная «плавающая» тень карточки */
export const resolveProductCardSoftElevationShadow = (c: ThemeColors) =>
  ({
    shadowColor: c.text,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffsetY: 4,
    elevation: 2,
  }) as const;

/** @deprecated light snapshot — prefer resolveProductCardSoftElevationShadow */
export const PRODUCT_CARD_SOFT_ELEVATION_SHADOW = resolveProductCardSoftElevationShadow(izColors);

export type ProductCardPromotionFramePalette = {
  borderWidth: number;
  borderColor: string;
  gradientStart: string;
  gradientEnd: string;
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffsetY: number;
  elevation: number;
};

/** color-mix из ProductCardFrame.css — paper fill = surface (не onContrast) */
export const resolveProductCardPromotionCompactFrame = (
  c: ThemeColors,
): Record<ProductCardPromotionTier, ProductCardPromotionFramePalette> => ({
  [PRODUCT_CARD_PROMOTION_TIER.GOLD]: {
    borderWidth: 2,
    borderColor: `${c.warning}ad`,
    gradientStart: c.surface,
    gradientEnd: c.surface,
    shadowColor: c.warning,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffsetY: 2,
    elevation: 2,
  },
  [PRODUCT_CARD_PROMOTION_TIER.TOP]: {
    borderWidth: 2,
    borderColor: `${c.accent}c7`,
    gradientStart: c.accentSoft,
    gradientEnd: c.accentSoft,
    shadowColor: c.accent,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffsetY: 4,
    elevation: 3,
  },
  [PRODUCT_CARD_PROMOTION_TIER.BANNER]: {
    borderWidth: 2,
    borderColor: c.border,
    gradientStart: c.surface,
    gradientEnd: c.surface,
    shadowColor: c.text,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffsetY: 4,
    elevation: 2,
  },
});

export type ProductCardPromotionFrameSurface = Pick<
  ProductCardPromotionFramePalette,
  | "borderWidth"
  | "borderColor"
  | "shadowColor"
  | "shadowOpacity"
  | "shadowRadius"
  | "shadowOffsetY"
  | "elevation"
> & {
  backgroundColor?: string;
};

/** product-card-premium-frame > .product-card */
export const resolveProductCardPremiumOnlyFrame = (
  c: ThemeColors,
): ProductCardPromotionFrameSurface => ({
  borderWidth: 2,
  borderColor: c.warning,
  backgroundColor: c.surface,
  shadowColor: "transparent",
  shadowOpacity: 0,
  shadowRadius: 0,
  shadowOffsetY: 0,
  elevation: 0,
});

/** product-card-promotion-frame.product-card-premium-frame--tier-* */
export const resolveProductCardPromotionPremiumCompactFrame = (
  c: ThemeColors,
): Record<ProductCardPromotionTier, ProductCardPromotionFramePalette> => ({
  [PRODUCT_CARD_PROMOTION_TIER.GOLD]: {
    borderWidth: 2,
    borderColor: c.warning,
    gradientStart: c.surface,
    gradientEnd: c.surface,
    shadowColor: c.warning,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffsetY: 2,
    elevation: 2,
  },
  [PRODUCT_CARD_PROMOTION_TIER.TOP]: {
    borderWidth: 2,
    borderColor: c.accent,
    gradientStart: c.surface,
    gradientEnd: c.surface,
    shadowColor: c.accent,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffsetY: 4,
    elevation: 3,
  },
  [PRODUCT_CARD_PROMOTION_TIER.BANNER]: {
    borderWidth: 2,
    borderColor: c.border,
    gradientStart: c.surface,
    gradientEnd: c.surface,
    shadowColor: c.text,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffsetY: 4,
    elevation: 2,
  },
});

/** ProductCardBannerLayout.css — inner banner card (нейтральный fill, без danger wash). */
export const resolveProductCardPromotionBannerInnerFrame = (c: ThemeColors) => {
  const soft = resolveProductCardSoftElevationShadow(c);
  return {
    borderWidth: 0,
    borderColor: "transparent",
    gradientStart: c.surface,
    gradientMid: c.surface,
    gradientEnd: c.surface,
    shadowColor: soft.shadowColor,
    shadowOpacity: soft.shadowOpacity,
    shadowRadius: soft.shadowRadius,
    shadowOffsetY: soft.shadowOffsetY,
    elevation: soft.elevation,
  } as const;
};

/** @deprecated light snapshot */
export const PRODUCT_CARD_PROMOTION_COMPACT_FRAME =
  resolveProductCardPromotionCompactFrame(izColors);

/** @deprecated light snapshot */
export const PRODUCT_CARD_PREMIUM_ONLY_FRAME = resolveProductCardPremiumOnlyFrame(izColors);

/** @deprecated light snapshot */
export const PRODUCT_CARD_PROMOTION_PREMIUM_COMPACT_FRAME =
  resolveProductCardPromotionPremiumCompactFrame(izColors);

/** @deprecated light snapshot */
export const PRODUCT_CARD_PROMOTION_BANNER_INNER_FRAME =
  resolveProductCardPromotionBannerInnerFrame(izColors);
