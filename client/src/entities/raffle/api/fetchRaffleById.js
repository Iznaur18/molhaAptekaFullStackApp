import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} raffleId
 * @returns {Promise<import('../model/types.js').RaffleFromApi>}
 */
export async function fetchRaffleById(raffleId) {
  try {
    const { data } = await apiClient.get(`/product/raffles/${raffleId}`);
    if (!data?.success || !data.data?.raffle) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.raffle;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.FETCH_RAFFLE_FALLBACK;
    throw new Error(message);
  }
}
