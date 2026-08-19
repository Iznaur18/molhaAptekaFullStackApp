import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ query: string }} params
 * @returns {Promise<import('../model/types.js').ProductCategoryNode[]>}
 */
export async function fetchProductCategorySearch({ query }) {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  try {
    const { data } = await apiClient.get("/product/categories/search", {
      params: { query: trimmed },
    });
    if (!data?.success || !Array.isArray(data.data?.categories)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.categories;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось найти категории";
    throw new Error(message);
  }
}
