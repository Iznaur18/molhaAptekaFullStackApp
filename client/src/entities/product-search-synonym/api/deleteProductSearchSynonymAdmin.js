import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} synonymId
 */
export async function deleteProductSearchSynonymAdmin(synonymId) {
  try {
    const { data } = await apiClient.delete(
      `/product/admin/search-synonyms/${synonymId}`,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось удалить синоним";
    throw new Error(message);
  }
}
