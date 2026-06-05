import { apiClient } from "../../../shared/api/apiClient.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} categoryId
 * @returns {Promise<{
 *   parent: import('../model/types.js').ProductCategoryNode;
 *   categories: import('../model/types.js').ProductCategoryNode[];
 * }>}
 */
export async function fetchProductCategoryChildren(categoryId) {
  try {
    const { data } = await apiClient.get(`/product/categories/${categoryId}/children`);

    if (!data?.success || !data.data?.parent) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      parent: data.data.parent,
      categories: data.data.categories ?? [],
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось загрузить подкатегории";
    throw new Error(message);
  }
}
