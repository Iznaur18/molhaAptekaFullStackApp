/** Daily return streak → скидка на услуги площадки (web v1). */

export const PROMO_RETURN_STREAK_TIME_ZONE = "Europe/Moscow";

export const PROMO_RETURN_STREAK_MAX_DAY = 7;

/** @type {Readonly<Record<number, number>>} */
export const PROMO_RETURN_STREAK_DISCOUNT_PERCENT_BY_DAY = Object.freeze({
  1: 5,
  2: 10,
  3: 20,
  4: 30,
  5: 50,
  6: 75,
  7: 95,
});

/**
 * Услуги, на которые действует скидка streak.
 * @type {readonly string[]}
 */
export const PROMO_RETURN_STREAK_SERVICE_KINDS = Object.freeze([
  "product_promotion",
  "site_header_banner",
  "seller_personal_category",
  "raffle_create_unlock",
]);

/**
 * @param {unknown} day
 * @returns {number}
 */
export function getPromoReturnStreakDiscountPercent(day) {
  const n = Math.floor(Number(day));
  if (!Number.isFinite(n) || n < 1) {
    return 0;
  }
  return PROMO_RETURN_STREAK_DISCOUNT_PERCENT_BY_DAY[n] ?? 0;
}

/**
 * @param {unknown} amount
 * @param {unknown} discountPercent
 * @returns {number}
 */
export function applyPromoReturnStreakDiscount(amount, discountPercent) {
  const base = Math.ceil(Number(amount));
  if (!Number.isFinite(base) || base <= 0) {
    return 0;
  }
  const percent = Math.floor(Number(discountPercent));
  if (!Number.isFinite(percent) || percent <= 0) {
    return base;
  }
  const clamped = Math.min(95, Math.max(0, percent));
  const discounted = Math.ceil((base * (100 - clamped)) / 100);
  return Math.max(1, discounted);
}
