import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<import('../model/types.js').RaffleFromApi[]>}
 */
export async function fetchPendingRaffles() {
  try {
    const { data } = await apiClient.get("/product/raffles/pending");
    if (!data?.success || !Array.isArray(data.data?.raffles)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.raffles;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_RAFFLES_QUEUE_FALLBACK;
    throw new Error(message);
  }
}
