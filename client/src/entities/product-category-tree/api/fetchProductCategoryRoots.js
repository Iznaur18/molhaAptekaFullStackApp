import { apiClient } from "../../../shared/api/apiClient.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<{ categories: import('../model/types.js').ProductCategoryNode[] }>}
 */
export async function fetchProductCategoryRoots() {
  try {
    const { data } = await apiClient.get("/product/categories/roots");

    if (!data?.success || !data.data?.categories) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return { categories: data.data.categories };
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось загрузить категории";
    throw new Error(message);
  }
}
