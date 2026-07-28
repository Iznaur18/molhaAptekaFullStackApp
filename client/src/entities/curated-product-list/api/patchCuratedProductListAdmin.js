import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} listId
 * @param {{ title?: string; regionCode?: string }} body
 * @returns {Promise<import('../model/types.js').CuratedProductListFromApi>}
 */
export async function patchCuratedProductListAdmin(listId, body) {
  try {
    const { data } = await apiClient.patch(`/product/admin/curated-lists/${listId}`, body);
    if (!data?.success || !data.data?.list) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.list;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось обновить список";
    throw new Error(message);
  }
}
