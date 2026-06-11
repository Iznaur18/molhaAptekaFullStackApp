import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ title: string }} body
 * @returns {Promise<import('../model/types.js').CuratedProductListFromApi>}
 */
export async function createCuratedProductListAdmin(body) {
  try {
    const { data } = await apiClient.post("/product/admin/curated-lists", body);
    if (!data?.success || !data.data?.list) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.list;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось создать список";
    throw new Error(message);
  }
}
