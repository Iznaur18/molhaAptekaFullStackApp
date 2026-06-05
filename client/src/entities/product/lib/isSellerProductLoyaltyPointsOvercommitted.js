import { resolveProductLoyaltyPointsPerUnit } from "./resolveProductLoyaltyPointsPerUnit.js";
import { resolveSellerMaxLoyaltyPointsPerUnit } from "./resolveSellerMaxLoyaltyPointsPerUnit.js";

/**
 * @param {import('../model/types.js').ProductFromApi | null | undefined} product
 * @param {{
 *   loyaltyPointsBalance: number;
 *   loyaltyPointsReserved?: number;
 *   sellerProducts?: import('../model/types.js').ProductFromApi[];
 * }} params
 */
export function isSellerProductLoyaltyPointsOvercommitted(product, params) {
  if (!product) {
    return false;
  }

  const perUnit = resolveProductLoyaltyPointsPerUnit(product);
  if (perUnit <= 0) {
    return false;
  }

  const editingProductId = product._id != null ? String(product._id) : null;
  const { maxPerUnit } = resolveSellerMaxLoyaltyPointsPerUnit({
    ...params,
    editingProductId,
  });

  return perUnit > maxPerUnit;
}
