import { apiClient, parseCategoryRootsData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { ProductCategoryRootNode } from "@/entities/product-category-display/model/types";

const normalizeCategoryRootNode = (raw: Record<string, unknown>): ProductCategoryRootNode => ({
  id: String(raw.id ?? raw._id ?? ""),
  slug: String(raw.slug ?? ""),
  labelRu: String(raw.labelRu ?? raw.name ?? ""),
  legacyProductCategory:
    typeof raw.legacyProductCategory === "string" ? raw.legacyProductCategory : null,
  isLeaf: raw.isLeaf === true,
});

export const fetchProductCategoryRoots = async (): Promise<ProductCategoryRootNode[]> => {
  try {
    const { data } = await apiClient.get("/product/categories/roots");
    const parsed = parseCategoryRootsData(data);
    const categories = Array.isArray(parsed.categories) ? parsed.categories : [];
    return categories
      .map((row) => normalizeCategoryRootNode(row as Record<string, unknown>))
      .filter((row) => row.id && row.slug);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_CATEGORY_ROOTS_FALLBACK));
  }
};
