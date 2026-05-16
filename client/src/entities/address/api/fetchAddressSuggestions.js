import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} query
 * @returns {Promise<import('../model/types.js').AddressSuggestionDto[]>}
 */
export async function fetchAddressSuggestions(query) {
  try {
    const { data } = await apiClient.post("/address/suggest", { query });

    if (!data?.success || !Array.isArray(data.data?.suggestions)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.suggestions;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      "Не удалось загрузить подсказки адреса";
    throw new Error(message);
  }
}
