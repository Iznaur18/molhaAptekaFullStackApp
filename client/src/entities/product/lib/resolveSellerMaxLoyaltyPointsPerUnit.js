import { sumSellerCatalogLoyaltyPointsPerUnit } from "./sumSellerCatalogLoyaltyPointsPerUnit.js";

/**
 * @param {{
 *   loyaltyPointsBalance: number;
 *   loyaltyPointsReserved?: number;
 *   sellerProducts?: import('../model/types.js').ProductFromApi[];
 *   editingProductId?: string | null;
 * }} params
 */
export function resolveSellerMaxLoyaltyPointsPerUnit({
  loyaltyPointsBalance,
  loyaltyPointsReserved = 0,
  sellerProducts = [],
  editingProductId = null,
}) {
  const balance = Math.max(0, Math.floor(Number(loyaltyPointsBalance)) || 0);
  const reserved = Math.max(0, Math.floor(Number(loyaltyPointsReserved)) || 0);
  const available = Math.max(0, balance - reserved);
  const catalogCommitted = sumSellerCatalogLoyaltyPointsPerUnit(
    sellerProducts,
    editingProductId,
  );
  const maxPerUnit = Math.max(0, available - catalogCommitted);

  return {
    available,
    catalogCommitted,
    maxPerUnit,
  };
}
