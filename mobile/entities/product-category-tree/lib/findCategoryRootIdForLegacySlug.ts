import type { ProductCategoryRootNode } from "@/entities/product-category-display/model/types";

export const findCategoryRootIdForLegacySlug = (
  roots: ProductCategoryRootNode[],
  legacySlug: string,
): string | null => {
  const normalized = String(legacySlug ?? "").trim();
  if (!normalized) {
    return null;
  }

  const match = roots.find(
    (root) => root.legacyProductCategory === normalized || root.slug === normalized,
  );

  return match?.id ?? null;
};
