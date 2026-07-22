import type { CatalogListFilters } from "@/entities/product/model/catalogListFilters";

type SimilarCatalogFilters = Pick<CatalogListFilters, "categoryId" | "productCategory">;

/** Leaf category id, иначе legacy `productCategory`. */
export const resolveProductSimilarCatalogFilters = (
  product: Record<string, unknown> | null | undefined,
): SimilarCatalogFilters | null => {
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
};
