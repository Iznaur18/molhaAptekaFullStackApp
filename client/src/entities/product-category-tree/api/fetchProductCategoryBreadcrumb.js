import { apiClient } from "../../../shared/api/apiClient.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} categoryId
 * @returns {Promise<{ breadcrumb: import('../model/types.js').ProductCategoryBreadcrumb }>}
 */
export async function fetchProductCategoryBreadcrumb(categoryId) {
  try {
    const { data } = await apiClient.get(
      `/product/categories/${categoryId}/breadcrumb`,
    );

    if (!data?.success || !data.data?.breadcrumb) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return { breadcrumb: data.data.breadcrumb };
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось загрузить путь категории";
    throw new Error(message);
  }
}
