import { resolveProductLoyaltyPointsPerUnit } from "@/entities/product/lib/resolveProductLoyaltyPointsPerUnit";

type SellerCatalogProduct = { _id?: string };

export const sumSellerCatalogLoyaltyPointsPerUnit = (
  products: SellerCatalogProduct[],
  excludeProductId: string | null = null,
): number => {
  if (!Array.isArray(products) || products.length === 0) {
    return 0;
  }

  const exclude = excludeProductId != null ? String(excludeProductId) : null;

  return products.reduce((sum, product) => {
    if (exclude != null && String(product?._id) === exclude) {
      return sum;
    }
    return sum + resolveProductLoyaltyPointsPerUnit(product);
  }, 0);
};
