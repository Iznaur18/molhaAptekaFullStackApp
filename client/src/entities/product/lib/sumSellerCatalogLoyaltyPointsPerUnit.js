import { resolveProductLoyaltyPointsPerUnit } from "./resolveProductLoyaltyPointsPerUnit.js";

/**
 * @param {import('../model/types.js').ProductFromApi[]} products
 * @param {string | null | undefined} [excludeProductId]
 */
export function sumSellerCatalogLoyaltyPointsPerUnit(
  products,
  excludeProductId = null,
) {
  if (!Array.isArray(products) || products.length === 0) {
    return 0;
  }

  const exclude =
    excludeProductId != null ? String(excludeProductId) : null;

  return products.reduce((sum, product) => {
    if (exclude != null && String(product?._id) === exclude) {
      return sum;
    }
    return sum + resolveProductLoyaltyPointsPerUnit(product);
  }, 0);
}
