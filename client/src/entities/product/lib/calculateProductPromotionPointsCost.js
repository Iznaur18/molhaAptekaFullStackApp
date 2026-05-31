/** Как на сервере: PRODUCT_PROMOTION_POINTS_PER_RUBLE = 2 */
const PRODUCT_PROMOTION_POINTS_PER_RUBLE = 2;

/**
 * @param {number} priceRub
 */
export function calculateProductPromotionPointsCost(priceRub) {
  const rub = Number(priceRub);
  if (!Number.isFinite(rub) || rub < 0) {
    return 0;
  }
  return Math.ceil(rub * PRODUCT_PROMOTION_POINTS_PER_RUBLE);
}
