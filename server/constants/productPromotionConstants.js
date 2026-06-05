import {
  LOYALTY_POINTS_PER_RUBLE,
  rublesToLoyaltyPoints,
} from "./loyaltyPointsConstants.js";

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

export const PRODUCT_PROMOTION_DEFAULT_TARIFFS = [
  { code: "24h", title: "24 часа", durationHours: 24, priceRub: 200, isActive: true },
  {
    code: "7d",
    title: "7 дней",
    durationHours: 24 * 7,
    priceRub: 1000,
    isActive: true,
  },
  {
    code: "30d",
    title: "30 дней",
    durationHours: 24 * 30,
    priceRub: 3000,
    isActive: true,
  },
];

export const PRODUCT_PROMOTION_REMINDER_HOURS = 1;

export const PRODUCT_PROMOTION_CRON_INTERVAL_MS = 5 * 60 * 1000;

/** @deprecated Используйте LOYALTY_POINTS_PER_RUBLE */
export const PRODUCT_PROMOTION_POINTS_PER_RUBLE = LOYALTY_POINTS_PER_RUBLE;

export const PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS = "points";
export const PRODUCT_PROMOTION_PAYMENT_METHOD_RUB = "rub";

export const PRODUCT_PROMOTION_PAYMENT_METHODS = [
  PRODUCT_PROMOTION_PAYMENT_METHOD_RUB,
  PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS,
];

/**
 * @param {number} priceRub
 */
export const calculateProductPromotionPointsCost = rublesToLoyaltyPoints;
