/**
 * @param {import('../model/types.js').ProductFromApi | null | undefined} product
 */
export function resolveProductLoyaltyPointsPerUnit(product) {
  const value = Math.floor(Number(product?.loyaltyPointsPerUnit));
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return value;
}
