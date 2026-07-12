import { rublesToLoyaltyPoints } from "./loyaltyPointsConstants.js";

export const PRODUCT_PROMOTION_STATUS_PENDING_STAFF = "pending_staff";
export const PRODUCT_PROMOTION_STATUS_ACTIVE = "active";
export const PRODUCT_PROMOTION_STATUS_EXPIRED = "expired";
export const PRODUCT_PROMOTION_STATUS_REJECTED = "rejected";
export const PRODUCT_PROMOTION_STATUS_CANCELLED_BY_ADMIN = "cancelled_by_admin";

export const PRODUCT_PROMOTION_STATUSES = [
  PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
  PRODUCT_PROMOTION_STATUS_ACTIVE,
  PRODUCT_PROMOTION_STATUS_EXPIRED,
  PRODUCT_PROMOTION_STATUS_REJECTED,
  PRODUCT_PROMOTION_STATUS_CANCELLED_BY_ADMIN,
];

export const PRODUCT_PROMOTION_TIER_GOLD = 1;
export const PRODUCT_PROMOTION_TIER_TOP = 2;
export const PRODUCT_PROMOTION_TIER_BANNER = 3;

export const PRODUCT_PROMOTION_TIERS = [
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_TOP,
  PRODUCT_PROMOTION_TIER_BANNER,
];

/** Доля от productPrice: L1 0.2%, L2 0.4%, L3 1%. */
export const PRODUCT_PROMOTION_TIER_RATES = {
  [PRODUCT_PROMOTION_TIER_GOLD]: 0.002,
  [PRODUCT_PROMOTION_TIER_TOP]: 0.004,
  [PRODUCT_PROMOTION_TIER_BANNER]: 0.01,
};

export const PRODUCT_PROMOTION_TIER_META = [
  {
    tier: PRODUCT_PROMOTION_TIER_GOLD,
    title: "Золото",
    description: "Золотая карточка без поднятия в каталоге",
  },
  {
    tier: PRODUCT_PROMOTION_TIER_TOP,
    title: "ТОП",
    description: "Фиолетовая карточка и поднятие в начало списка",
  },
  {
    tier: PRODUCT_PROMOTION_TIER_BANNER,
    title: "Баннер",
    description: "Широкая карточка на всю строку и поднятие в начало списка",
  },
];

export const PRODUCT_PROMOTION_DURATION_OPTIONS = [
  { code: "24h", title: "24 часа", durationHours: 24, durationMult: 1 },
  { code: "7d", title: "7 дней", durationHours: 24 * 7, durationMult: 6 },
  { code: "30d", title: "30 дней", durationHours: 24 * 30, durationMult: 23 },
];

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
 * @param {string} code
 */
export const findProductPromotionDuration = (code) =>
  PRODUCT_PROMOTION_DURATION_OPTIONS.find((item) => item.code === code) ?? null;

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
