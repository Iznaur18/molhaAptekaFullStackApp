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

/**
 * Контракт — обычный JS, поэтому TS выводит у карты ставок литеральный тип
 * { 1: number; 2: number; 3: number } и запрещает индексировать её произвольным
 * number. Расширяем до Record: промах по ключу код и так проверяет на null.
 */
const TIER_RATE_BY_TIER: Record<number, number | undefined> =
  PRODUCT_PROMOTION_TIER_RATES;

export const PRODUCT_PROMOTION_TIER_LABELS: Record<number, string> = {
  [PRODUCT_PROMOTION_TIER_GOLD]: "Золото",
  [PRODUCT_PROMOTION_TIER_TOP]: "Топ",
  [PRODUCT_PROMOTION_TIER_BANNER]: "Баннер",
};

export const getProductPromotionTierLabel = (tier: number | null | undefined): string =>
  PRODUCT_PROMOTION_TIER_LABELS[Number(tier)] ?? "";

// Цену считает контракт: тем же счётом её выставляет сервер, а своя копия
// формулы здесь уже расходилась с серверной — см.
// calculateProductPromotionAmountRub.

export const formatProductPromotionTierRatePercent = (tier: number): string => {
  const rate = TIER_RATE_BY_TIER[Number(tier)];
  if (rate == null) {
    return "";
  }
  const percent = rate * 100;
  return Number.isInteger(percent) ? String(percent) : percent.toFixed(1).replace(/\.0$/, "");
};
