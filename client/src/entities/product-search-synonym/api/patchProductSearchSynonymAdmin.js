import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} synonymId
 * @param {{ token?: string; categories?: string[] }} payload
 */
export async function patchProductSearchSynonymAdmin(synonymId, payload) {
  try {
    const { data } = await apiClient.patch(
      `/product/admin/search-synonyms/${synonymId}`,
      payload,
    );
    if (!data?.success || !data.data?.synonym) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.synonym;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось обновить синоним";
    throw new Error(message);
  }
}
