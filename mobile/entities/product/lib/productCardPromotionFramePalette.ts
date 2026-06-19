/** Синхронизировано с client ProductCardFrame.css + designTokens.css */
export const PRODUCT_CARD_PROMOTION_TIER = {
  GOLD: 1,
  TOP: 2,
  BANNER: 3,
} as const;

export type ProductCardPromotionTier =
  (typeof PRODUCT_CARD_PROMOTION_TIER)[keyof typeof PRODUCT_CARD_PROMOTION_TIER];

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
    borderColor: "rgba(217, 119, 6, 0.68)",
    gradientStart: "#fff8e6",
    gradientEnd: "#fffef8",
    shadowColor: "#d97706",
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffsetY: 2,
    elevation: 2,
  },
  [PRODUCT_CARD_PROMOTION_TIER.TOP]: {
    borderWidth: 2,
    borderColor: "rgba(124, 58, 237, 0.78)",
    gradientStart: "#ebe4fd",
    gradientEnd: "#f3efff",
    shadowColor: "#7c3aed",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffsetY: 4,
    elevation: 3,
  },
  [PRODUCT_CARD_PROMOTION_TIER.BANNER]: {
    borderWidth: 2,
    borderColor: "rgba(220, 38, 38, 0.72)",
    gradientStart: "#fef2f2",
    gradientEnd: "#fffafa",
    shadowColor: "#dc2626",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffsetY: 6,
    elevation: 4,
  },
};

/** ProductCardBannerLayout.css — inner banner card */
export const PRODUCT_CARD_PROMOTION_BANNER_INNER_FRAME = {
  borderWidth: 1,
  borderColor: "#dc2626",
  gradientStart: "#ffffff",
  gradientMid: "#fff5f5",
  gradientEnd: "#fef2f2",
  shadowColor: "#dc2626",
  shadowOpacity: 0.12,
  shadowRadius: 14,
  shadowOffsetY: 2,
  elevation: 2,
} as const;
