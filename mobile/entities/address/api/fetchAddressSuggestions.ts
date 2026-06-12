import { apiClient, parseAddressSuggestionsData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const fetchAddressSuggestions = async (query: string) => {
  try {
    const { data } = await apiClient.post("/address/suggest", { query });
    return parseAddressSuggestionsData(data);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_ADDRESS_SUGGESTIONS_FALLBACK),
    );
  }
};
