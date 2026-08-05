import { rublesToLoyaltyPoints } from "../../../shared/config/loyaltyPointsConstants.js";
import {
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_TOP,
  PRODUCT_PROMOTION_TIER_BANNER,
  PRODUCT_PROMOTION_TIER_RATES,
  PRODUCT_PROMOTION_DURATION_MULT,
} from "@molha/api-contract";

export {
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_TOP,
  PRODUCT_PROMOTION_TIER_BANNER,
  PRODUCT_PROMOTION_TIER_RATES,
  PRODUCT_PROMOTION_DURATION_MULT,
};

/** @type {Record<number, string>} */
export const PRODUCT_PROMOTION_TIER_LABELS = {
  [PRODUCT_PROMOTION_TIER_GOLD]: "Золото",
  [PRODUCT_PROMOTION_TIER_TOP]: "Топ",
  [PRODUCT_PROMOTION_TIER_BANNER]: "Баннер",
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
