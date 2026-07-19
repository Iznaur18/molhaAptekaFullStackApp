import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} categoryId
 * @returns {Promise<{ deletedId: string; deletedIds: string[] }>}
 */
export async function deleteProductCategoryAdmin(categoryId) {
  try {
    const { data } = await apiClient.delete(`/product/admin/categories/${categoryId}`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    const deletedId = String(data?.data?.deletedId ?? categoryId);
    const deletedIds = Array.isArray(data?.data?.deletedIds)
      ? data.data.deletedIds.map(String)
      : [deletedId];
    return { deletedId, deletedIds };
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось удалить категорию";
    throw new Error(message);
  }
}
