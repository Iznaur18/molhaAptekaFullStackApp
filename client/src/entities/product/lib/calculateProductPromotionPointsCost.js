import {
  calculateProductPromotionAmountRub,
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_TOP,
  PRODUCT_PROMOTION_TIER_BANNER,
  PRODUCT_PROMOTION_TIER_RATES,
  PRODUCT_PROMOTION_DURATION_MULT,
} from "@molha/api-contract";

export {
  calculateProductPromotionAmountRub,
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

// Цену считает контракт: она же выставляется счётом на сервере, и своя копия
// формулы здесь уже расходилась с серверной — см.
// calculateProductPromotionAmountRub.

/**
 * @param {number | null | undefined} tier
 */
export function getProductPromotionTierLabel(tier) {
  return PRODUCT_PROMOTION_TIER_LABELS[Number(tier)] ?? "";
}
