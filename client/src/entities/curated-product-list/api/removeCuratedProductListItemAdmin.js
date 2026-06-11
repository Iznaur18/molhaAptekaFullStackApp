import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} listId
 * @param {string} productId
 * @returns {Promise<import('../model/types.js').CuratedProductListFromApi>}
 */
export async function removeCuratedProductListItemAdmin(listId, productId) {
  try {
    const { data } = await apiClient.delete(
      `/product/admin/curated-lists/${listId}/products/${productId}`,
    );
    if (!data?.success || !data.data?.list) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.list;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось удалить товар из списка";
    throw new Error(message);
  }
}
