import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

import {
  isAddressServiceUnavailable,
  markAddressServiceUnavailable,
  resetAddressServiceUnavailable,
} from "./addressServiceAvailability.js";

export function resetAddressGeolocateUnavailableForTests() {
  resetAddressServiceUnavailable();
}

/**
 * @param {{ lat: number; lon: number }} point
 * @returns {Promise<import('../model/types.js').AddressSuggestionDto[]>}
 */
export async function fetchAddressGeolocate({ lat, lon }) {
  if (isAddressServiceUnavailable()) {
    return [];
  }

  try {
    const { data } = await apiClient.post("/address/geolocate", { lat, lon });

    if (!data?.success || !Array.isArray(data.data?.suggestions)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.suggestions;
  } catch (e) {
    const status = e?.response?.status;
    if (status === 503) {
      markAddressServiceUnavailable();
      return [];
    }
    const message =
      e?.response?.data?.message ??
      e?.message ??
      "Не удалось определить адрес по карте";
    throw new Error(message);
  }
}
