import { apiClient, parseAddressSuggestionsData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import {
  isAddressServiceUnavailable,
  markAddressServiceUnavailable,
  resetAddressServiceUnavailable,
} from "./addressServiceAvailability";

export const resetAddressGeolocateUnavailableForTests = () => {
  resetAddressServiceUnavailable();
};

export const fetchAddressGeolocate = async (point: { lat: number; lon: number }) => {
  if (isAddressServiceUnavailable()) {
    return [];
  }

  try {
    const { data } = await apiClient.post("/address/geolocate", point);
    return parseAddressSuggestionsData(data);
  } catch (error) {
    const status =
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "status" in error.response
        ? Number((error.response as { status?: number }).status)
        : NaN;
    if (status === 503) {
      markAddressServiceUnavailable();
      return [];
    }
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_ADDRESS_GEOLOCATE_FALLBACK),
    );
  }
};
