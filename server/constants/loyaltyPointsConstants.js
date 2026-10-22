/** 1 балл = 1 ₽ номинала (списание, пополнение, тарифы). */
export const LOYALTY_POINTS_PER_RUBLE = 1;

/**
 * @param {number} priceRub
 */
export const rublesToLoyaltyPoints = (priceRub) => {
  const rub = Number(priceRub);
  if (!Number.isFinite(rub) || rub < 0) {
    return 0;
  }
  return Math.ceil(rub * LOYALTY_POINTS_PER_RUBLE);
};

/** Состояния оплаты позиции баллами (товар за баллы). */
export const POINTS_PAYMENT_STATE_HELD = "held";
export const POINTS_PAYMENT_STATE_RELEASED = "released";
export const POINTS_PAYMENT_STATE_REFUNDED = "refunded";
export const POINTS_PAYMENT_STATES = [
  POINTS_PAYMENT_STATE_HELD,
  POINTS_PAYMENT_STATE_RELEASED,
  POINTS_PAYMENT_STATE_REFUNDED,
];

/** Сколько позиций за раз размораживает крон. */
export const POINTS_PAYMENT_RELEASE_BATCH_SIZE = 100;
