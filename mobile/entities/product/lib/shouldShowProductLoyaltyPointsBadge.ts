import { resolveProductLoyaltyPointsPerUnit } from "./resolveProductLoyaltyPointsPerUnit";

export const shouldShowProductLoyaltyPointsBadge = (product: unknown): boolean => {
  if (!product || typeof product !== "object") {
    return false;
  }
  const price = (product as { productPrice?: number }).productPrice;
  if (price == null || !Number.isFinite(Number(price))) {
    return false;
  }
  return resolveProductLoyaltyPointsPerUnit(product) > 0;
};
