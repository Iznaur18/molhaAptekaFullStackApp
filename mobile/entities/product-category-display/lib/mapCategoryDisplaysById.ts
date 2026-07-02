import type { ProductCategoryDisplayFromApi } from "@/entities/product-category-display/lib/resolveProductCategoryDisplay";

export const mapCategoryDisplaysById = (
  displays: ProductCategoryDisplayFromApi[],
): Map<string, ProductCategoryDisplayFromApi> => {
  const map = new Map<string, ProductCategoryDisplayFromApi>();

  for (const row of displays) {
    if (typeof row.categoryId === "string" && row.categoryId.trim()) {
      map.set(row.categoryId.trim(), row);
    }
  }

  return map;
};
