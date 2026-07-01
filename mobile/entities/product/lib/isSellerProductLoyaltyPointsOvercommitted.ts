import { resolveProductLoyaltyPointsPerUnit } from "@/entities/product/lib/resolveProductLoyaltyPointsPerUnit";
import { resolveSellerMaxLoyaltyPointsPerUnit } from "@/entities/product/lib/resolveSellerMaxLoyaltyPointsPerUnit";

type LoyaltyOvercommitProduct = { _id?: string };

type IsSellerProductLoyaltyPointsOvercommittedParams = {
  loyaltyPointsBalance: number;
  loyaltyPointsReserved?: number;
  sellerProducts?: LoyaltyOvercommitProduct[];
};

export const isSellerProductLoyaltyPointsOvercommitted = (
  product: LoyaltyOvercommitProduct | null | undefined,
  params: IsSellerProductLoyaltyPointsOvercommittedParams,
): boolean => {
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
};
