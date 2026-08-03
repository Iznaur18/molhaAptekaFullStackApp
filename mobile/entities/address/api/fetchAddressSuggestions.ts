import { apiClient, parseAddressSuggestionsData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

/** После 503 не долбим /address/suggest на каждый keystroke. */
let suggestUnavailable = false;

export const resetAddressSuggestUnavailableForTests = () => {
  suggestUnavailable = false;
};

export const fetchAddressSuggestions = async (query: string) => {
  if (suggestUnavailable) {
    return [];
  }

  try {
    const { data } = await apiClient.post("/address/suggest", { query });
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
      suggestUnavailable = true;
      return [];
    }
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_ADDRESS_SUGGESTIONS_FALLBACK),
    );
  }
};
