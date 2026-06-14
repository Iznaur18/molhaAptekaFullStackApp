/** Как на сервере: 1 балл = 1 ₽ */
export const LOYALTY_POINTS_PER_RUBLE = 1;

export const rublesToLoyaltyPoints = (priceRub: number): number => {
  const rub = Number(priceRub);
  if (!Number.isFinite(rub) || rub < 0) {
    return 0;
  }
  return Math.ceil(rub * LOYALTY_POINTS_PER_RUBLE);
};
