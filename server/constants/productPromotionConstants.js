import { rublesToLoyaltyPoints } from "./loyaltyPointsConstants.js";
import {
  PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
  PRODUCT_PROMOTION_STATUS_ACTIVE,
  PRODUCT_PROMOTION_STATUS_EXPIRED,
  PRODUCT_PROMOTION_STATUS_REJECTED,
  PRODUCT_PROMOTION_STATUS_CANCELLED_BY_ADMIN,
  PRODUCT_PROMOTION_STATUSES,
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_TOP,
  PRODUCT_PROMOTION_TIER_BANNER,
  PRODUCT_PROMOTION_TIERS,
  PRODUCT_PROMOTION_TIER_RATES,
  PRODUCT_PROMOTION_DURATION_OPTIONS as PRODUCT_PROMOTION_DURATION_BASE,
} from "@molha/api-contract";

export {
  PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
  PRODUCT_PROMOTION_STATUS_ACTIVE,
  PRODUCT_PROMOTION_STATUS_EXPIRED,
  PRODUCT_PROMOTION_STATUS_REJECTED,
  PRODUCT_PROMOTION_STATUS_CANCELLED_BY_ADMIN,
  PRODUCT_PROMOTION_STATUSES,
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_TOP,
  PRODUCT_PROMOTION_TIER_BANNER,
  PRODUCT_PROMOTION_TIERS,
  PRODUCT_PROMOTION_TIER_RATES,
};

export const PRODUCT_PROMOTION_TIER_META = [
  {
    tier: PRODUCT_PROMOTION_TIER_GOLD,
    title: "Золото",
    description:
      "Карточка товара поднимается на самый верх в главном экране, но только для пользователей, находящихся в пределах вашего региона.",
  },
  {
    tier: PRODUCT_PROMOTION_TIER_TOP,
    title: "ТОП",
    description:
      "Карточка товара поднимается на самый верх в главном экране для всех пользователей в любом регионе.",
  },
  {
    tier: PRODUCT_PROMOTION_TIER_BANNER,
    title: "Баннер",
    description:
      "Карточка товара поднимается на самый верх в главном экране, но только для пользователей, находящихся в пределах вашего региона. Карточка растягивается на всю ширину экрана, становясь заметнее.",
  },
];

const DURATION_TITLE_RU = {
  "24h": "24 часа",
  "7d": "7 дней",
  "30d": "30 дней",
};

export const PRODUCT_PROMOTION_DURATION_OPTIONS = PRODUCT_PROMOTION_DURATION_BASE.map(
  (item) => ({
    ...item,
    title: DURATION_TITLE_RU[item.code] ?? item.code,
  }),
);

/**
 * Local finder — includes RU `title` required by ProductPromotionModel.
 * @param {string} code
 */
export const findProductPromotionDuration = (code) =>
  PRODUCT_PROMOTION_DURATION_OPTIONS.find((item) => item.code === code) ?? null;

export const PRODUCT_PROMOTION_REMINDER_HOURS = 1;

export const PRODUCT_PROMOTION_CRON_INTERVAL_MS = 5 * 60 * 1000;

export const PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS = "points";
export const PRODUCT_PROMOTION_PAYMENT_METHOD_RUB = "rub";

export const PRODUCT_PROMOTION_PAYMENT_METHODS = [
  PRODUCT_PROMOTION_PAYMENT_METHOD_RUB,
  PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS,
];

/**
 * @param {number} tier
 */
export const isValidProductPromotionTier = (tier) =>
  PRODUCT_PROMOTION_TIERS.includes(Number(tier));

/**
 * @param {{ productPrice: number; tier: number; durationCode: string }} params
 */
export const calculateProductPromotionPointsCost = ({
  productPrice,
  tier,
  durationCode,
}) => {
  const duration = findProductPromotionDuration(durationCode);
  const rate = PRODUCT_PROMOTION_TIER_RATES[Number(tier)];
  if (!duration || rate == null) {
    return 0;
  }
  const priceRub = Number(productPrice) * rate * duration.durationMult;
  return rublesToLoyaltyPoints(priceRub);
};

/**
 * @param {{ productPrice: number; tier: number; durationCode: string }} params
 */
export const calculateProductPromotionAmountRub = ({
  productPrice,
  tier,
  durationCode,
}) => {
  const duration = findProductPromotionDuration(durationCode);
  const rate = PRODUCT_PROMOTION_TIER_RATES[Number(tier)];
  if (!duration || rate == null) {
    return 0;
  }
  return Number(productPrice) * rate * duration.durationMult;
};
