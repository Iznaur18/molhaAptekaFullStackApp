import { rublesToLoyaltyPoints } from "../../../shared/config/loyaltyPointsConstants.js";

export const PRODUCT_PROMOTION_TIER_GOLD = 1;
export const PRODUCT_PROMOTION_TIER_TOP = 2;
export const PRODUCT_PROMOTION_TIER_BANNER = 3;

/** @type {Record<number, number>} */
export const PRODUCT_PROMOTION_TIER_RATES = {
  [PRODUCT_PROMOTION_TIER_GOLD]: 0.002,
  [PRODUCT_PROMOTION_TIER_TOP]: 0.004,
  [PRODUCT_PROMOTION_TIER_BANNER]: 0.01,
};

/** @type {Record<number, string>} */
export const PRODUCT_PROMOTION_TIER_LABELS = {
  [PRODUCT_PROMOTION_TIER_GOLD]: "Золото",
  [PRODUCT_PROMOTION_TIER_TOP]: "Топ",
  [PRODUCT_PROMOTION_TIER_BANNER]: "Баннер",
};

/** @type {Record<string, number>} */
export const PRODUCT_PROMOTION_DURATION_MULT = {
  "24h": 1,
  "7d": 7,
  "30d": 30,
};

/**
 * @param {{ productPrice: number; tier: number; durationCode: string }} params
 */
export function calculateProductPromotionPointsCost({ productPrice, tier, durationCode }) {
  const rate = PRODUCT_PROMOTION_TIER_RATES[Number(tier)];
  const durationMult = PRODUCT_PROMOTION_DURATION_MULT[durationCode];
  if (rate == null || durationMult == null) {
    return 0;
  }
  const priceRub = Number(productPrice) * rate * durationMult;
  return rublesToLoyaltyPoints(priceRub);
}

/**
 * @param {number | null | undefined} tier
 */
export function getProductPromotionTierLabel(tier) {
  return PRODUCT_PROMOTION_TIER_LABELS[Number(tier)] ?? "";
}
