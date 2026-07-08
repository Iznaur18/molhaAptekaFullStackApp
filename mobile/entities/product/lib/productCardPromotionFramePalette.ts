import { semanticColors } from "@/shared/theme/semanticColors";

/** Синхронизировано с client ProductCardFrame.css + designTokens.css */
export const PRODUCT_CARD_PROMOTION_TIER = {
  GOLD: 1,
  TOP: 2,
  BANNER: 3,
} as const;

export type ProductCardPromotionTier =
  (typeof PRODUCT_CARD_PROMOTION_TIER)[keyof typeof PRODUCT_CARD_PROMOTION_TIER];

/** Паритет с ProductCardFrame.css — нейтральная «плавающая» тень карточки */
export const PRODUCT_CARD_SOFT_ELEVATION_SHADOW = {
  shadowColor: semanticColors.text,
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffsetY: 4,
  elevation: 2,
} as const;

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

/** color-mix из ProductCardFrame.css — precomputed для RN */
export const PRODUCT_CARD_PROMOTION_COMPACT_FRAME: Record<
  ProductCardPromotionTier,
  ProductCardPromotionFramePalette
> = {
  [PRODUCT_CARD_PROMOTION_TIER.GOLD]: {
    borderWidth: 2,
    borderColor: `${semanticColors.warning}ad`,
    gradientStart: semanticColors.onContrast,
    gradientEnd: semanticColors.onContrast,
    shadowColor: semanticColors.warning,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffsetY: 2,
    elevation: 2,
  },
  [PRODUCT_CARD_PROMOTION_TIER.TOP]: {
    borderWidth: 2,
    borderColor: `${semanticColors.accent}c7`,
    gradientStart: semanticColors.accentSoft,
    gradientEnd: semanticColors.accentSoft,
    shadowColor: semanticColors.accent,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffsetY: 4,
    elevation: 3,
  },
  [PRODUCT_CARD_PROMOTION_TIER.BANNER]: {
    borderWidth: 2,
    borderColor: `${semanticColors.danger}b8`,
    gradientStart: semanticColors.dangerSurface,
    gradientEnd: semanticColors.onContrast,
    shadowColor: semanticColors.danger,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffsetY: 6,
    elevation: 4,
  },
};

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
export const PRODUCT_CARD_PREMIUM_ONLY_FRAME: ProductCardPromotionFrameSurface = {
  borderWidth: 2,
  borderColor: semanticColors.warning,
  backgroundColor: semanticColors.onContrast,
  shadowColor: "transparent",
  shadowOpacity: 0,
  shadowRadius: 0,
  shadowOffsetY: 0,
  elevation: 0,
};

/** product-card-promotion-frame.product-card-premium-frame--tier-* */
export const PRODUCT_CARD_PROMOTION_PREMIUM_COMPACT_FRAME: Record<
  ProductCardPromotionTier,
  ProductCardPromotionFramePalette
> = {
  [PRODUCT_CARD_PROMOTION_TIER.GOLD]: {
    borderWidth: 2,
    borderColor: semanticColors.warning,
    gradientStart: semanticColors.onContrast,
    gradientEnd: semanticColors.onContrast,
    shadowColor: semanticColors.warning,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffsetY: 2,
    elevation: 2,
  },
  [PRODUCT_CARD_PROMOTION_TIER.TOP]: {
    borderWidth: 2,
    borderColor: semanticColors.accent,
    gradientStart: semanticColors.onContrast,
    gradientEnd: semanticColors.onContrast,
    shadowColor: semanticColors.accent,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffsetY: 4,
    elevation: 3,
  },
  [PRODUCT_CARD_PROMOTION_TIER.BANNER]: {
    borderWidth: 2,
    borderColor: semanticColors.warning,
    gradientStart: semanticColors.dangerSurface,
    gradientEnd: semanticColors.onContrast,
    shadowColor: semanticColors.danger,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffsetY: 6,
    elevation: 4,
  },
};

/** ProductCardBannerLayout.css — inner banner card */
export const PRODUCT_CARD_PROMOTION_BANNER_INNER_FRAME = {
  borderWidth: 1,
  borderColor: semanticColors.danger,
  gradientStart: semanticColors.onContrast,
  gradientMid: semanticColors.dangerSurface,
  gradientEnd: semanticColors.dangerSurface,
  shadowColor: semanticColors.danger,
  shadowOpacity: 0.12,
  shadowRadius: 14,
  shadowOffsetY: 2,
  elevation: 2,
} as const;
