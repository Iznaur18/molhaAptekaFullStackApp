import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<import('../model/adminTypes.js').ProductCategoryAdminRow[]>}
 */
export async function fetchProductCategoriesAdmin() {
  try {
    const { data } = await apiClient.get("/product/admin/categories");
    if (!data?.success || !Array.isArray(data.data?.categories)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.categories;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      "Не удалось загрузить дерево категорий";
    throw new Error(message);
  }
}
