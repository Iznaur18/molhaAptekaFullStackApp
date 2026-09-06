import {
  calculateProductPromotionAmountRub,
  normalizeProductPromotionAmountRub,
  PRODUCT_PROMOTION_MIN_AMOUNT_RUB,
  PRODUCT_PROMOTION_STATUS_AWAITING_PAYMENT,
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
  calculateProductPromotionAmountRub,
  normalizeProductPromotionAmountRub,
  PRODUCT_PROMOTION_MIN_AMOUNT_RUB,
  PRODUCT_PROMOTION_STATUS_AWAITING_PAYMENT,
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
/** Прямая оплата по СБП через ЮKassa — способ по умолчанию с 09.2026. */
export const PRODUCT_PROMOTION_PAYMENT_METHOD_SBP = "sbp";
export const PRODUCT_PROMOTION_PAYMENT_METHOD_RUB = "rub";

export const PRODUCT_PROMOTION_PAYMENT_METHODS = [
  PRODUCT_PROMOTION_PAYMENT_METHOD_SBP,
  PRODUCT_PROMOTION_PAYMENT_METHOD_RUB,
  PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS,
];

/**
 * @param {number} tier
 */
export const isValidProductPromotionTier = (tier) =>
  PRODUCT_PROMOTION_TIERS.includes(Number(tier));

// Цена продвижения считается в контракте: три копии формулы (сервер, веб,
// мобилка) уже разошлись однажды — см. calculateProductPromotionAmountRub.
