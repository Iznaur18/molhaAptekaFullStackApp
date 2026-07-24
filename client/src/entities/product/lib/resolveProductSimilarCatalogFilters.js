/**
 * Leaf category id, иначе legacy `productCategory`.
 *
 * @param {import("../model/types.js").ProductFromApi | Record<string, unknown> | null | undefined} product
 * @returns {{ categoryId?: string; productCategory?: string } | null}
 */
export function resolveProductSimilarCatalogFilters(product) {
  if (product == null) {
    return null;
  }

  const categoryId =
    product.productCategoryId != null ? String(product.productCategoryId).trim() : "";
  if (categoryId.length > 0) {
    return { categoryId };
  }

  const productCategory =
    typeof product.productCategory === "string" ? product.productCategory.trim() : "";
  if (productCategory.length > 0) {
    return { productCategory };
  }

  return null;
}
