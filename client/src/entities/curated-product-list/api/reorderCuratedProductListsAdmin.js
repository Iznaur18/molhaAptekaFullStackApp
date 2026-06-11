import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string[]} orderedListIds
 * @returns {Promise<import('../model/types.js').CuratedProductListFromApi[]>}
 */
export async function reorderCuratedProductListsAdmin(orderedListIds) {
  try {
    const { data } = await apiClient.patch("/product/admin/curated-lists/reorder", {
      orderedListIds,
    });
    if (!data?.success || !Array.isArray(data.data?.lists)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.lists;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось изменить порядок списков";
    throw new Error(message);
  }
}
