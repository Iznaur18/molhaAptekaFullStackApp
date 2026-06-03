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
