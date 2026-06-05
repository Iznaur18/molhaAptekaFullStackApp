import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<import('../model/types.js').ProductSearchSynonymRow[]>}
 */
export async function fetchProductSearchSynonymsAdmin() {
  try {
    const { data } = await apiClient.get("/product/admin/search-synonyms");
    if (!data?.success || !Array.isArray(data.data?.synonyms)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.synonyms;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      "Не удалось загрузить синонимы поиска";
    throw new Error(message);
  }
}
