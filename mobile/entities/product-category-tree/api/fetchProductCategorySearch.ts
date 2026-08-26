import { apiClient, parseCategoryRootsData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type ProductCategorySearchResult = {
  id: string;
  labelRu: string;
  pathLabelRu: string[];
  isLeaf: boolean;
  /** Ключи характеристик категории — мастер подставляет их продавцу. */
  defaultCharacteristicKeys: string[];
};

const normalizeSearchNode = (raw: Record<string, unknown>): ProductCategorySearchResult => ({
  id: String(raw.id ?? raw._id ?? ""),
  labelRu: String(raw.labelRu ?? raw.name ?? ""),
  pathLabelRu: Array.isArray(raw.pathLabelRu) ? raw.pathLabelRu.map(String) : [],
  isLeaf: raw.isLeaf === true,
  defaultCharacteristicKeys: Array.isArray(raw.defaultCharacteristicKeys)
    ? raw.defaultCharacteristicKeys.map(String)
    : [],
});

export const fetchProductCategorySearch = async (
  query: string,
): Promise<ProductCategorySearchResult[]> => {
  try {
    const { data } = await apiClient.get("/product/categories/search", {
      params: { query },
    });
    const parsed = parseCategoryRootsData(data);
    return parsed.categories
      .map((row) => normalizeSearchNode(row as Record<string, unknown>))
      .filter((row) => row.id && row.isLeaf);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_CATEGORY_CHILDREN_FALLBACK),
    );
  }
};
