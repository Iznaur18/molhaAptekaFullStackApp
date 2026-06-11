import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<import('../model/types.js').CuratedProductListFromApi[]>}
 */
export async function fetchCuratedProductListsAdmin() {
  try {
    const { data } = await apiClient.get("/product/admin/curated-lists");
    if (!data?.success || !Array.isArray(data.data?.lists)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.lists;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      "Не удалось загрузить подборки";
    throw new Error(message);
  }
}
