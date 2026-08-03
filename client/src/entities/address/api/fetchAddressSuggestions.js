import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/** После 503 не долбим /address/suggest на каждый keystroke. */
let suggestUnavailable = false;

export function resetAddressSuggestUnavailableForTests() {
  suggestUnavailable = false;
}

/**
 * @param {string} query
 * @returns {Promise<import('../model/types.js').AddressSuggestionDto[]>}
 */
export async function fetchAddressSuggestions(query) {
  if (suggestUnavailable) {
    return [];
  }

  try {
    const { data } = await apiClient.post("/address/suggest", { query });

    if (!data?.success || !Array.isArray(data.data?.suggestions)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.suggestions;
  } catch (e) {
    const status = e?.response?.status;
    if (status === 503) {
      suggestUnavailable = true;
      return [];
    }
    const message =
      e?.response?.data?.message ??
      e?.message ??
      "Не удалось загрузить подсказки адреса";
    throw new Error(message);
  }
}
