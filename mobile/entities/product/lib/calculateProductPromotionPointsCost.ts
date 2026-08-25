import { rublesToLoyaltyPoints } from "@/shared/config/loyaltyPointsConstants";
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

type CalculatePromotionCostParams = {
  productPrice: number;
  tier: number;
  durationCode: string;
};

export const calculateProductPromotionPointsCost = ({
  productPrice,
  tier,
  durationCode,
}: CalculatePromotionCostParams): number => {
  const rate = TIER_RATE_BY_TIER[Number(tier)];
  const durationMult = PRODUCT_PROMOTION_DURATION_MULT[durationCode];
  if (rate == null || durationMult == null) {
    return 0;
  }
  const priceRub = Number(productPrice) * rate * durationMult;
  return rublesToLoyaltyPoints(priceRub);
};

export const formatProductPromotionTierRatePercent = (tier: number): string => {
  const rate = TIER_RATE_BY_TIER[Number(tier)];
  if (rate == null) {
    return "";
  }
  const percent = rate * 100;
  return Number.isInteger(percent) ? String(percent) : percent.toFixed(1).replace(/\.0$/, "");
};
