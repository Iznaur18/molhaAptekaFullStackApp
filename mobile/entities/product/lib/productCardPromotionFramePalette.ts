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
  shadowColor: "#0f172a",
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
    gradientStart: "#c4b5fd",
    gradientEnd: "#ede9fe",
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
  borderColor: "#d4af37",
  backgroundColor: "#ffffff",
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
    borderColor: "#d97706",
    gradientStart: "#fff4d6",
    gradientEnd: "#fffef5",
    shadowColor: "#d97706",
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffsetY: 2,
    elevation: 2,
  },
  [PRODUCT_CARD_PROMOTION_TIER.TOP]: {
    borderWidth: 2,
    borderColor: "#8c4fcc",
    gradientStart: "#ffffff",
    gradientEnd: "#ffffff",
    // gradientEnd: "#c4b5fd",
    shadowColor: "#7c3aed",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffsetY: 4,
    elevation: 3,
  },
  [PRODUCT_CARD_PROMOTION_TIER.BANNER]: {
    borderWidth: 2,
    borderColor: "#c9a227",
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
