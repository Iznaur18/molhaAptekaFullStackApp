import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<{
 *   raffle: import('../model/types.js').RaffleFromApi | null;
 *   archive: import('../model/types.js').RaffleFromApi[];
 * }>}
 */
export async function fetchMyRaffle() {
  try {
    const { data } = await apiClient.get("/product/raffles/my");
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return {
      raffle: data.data?.raffle ?? null,
      archive: Array.isArray(data.data?.archive) ? data.data.archive : [],
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_MY_RAFFLE_FALLBACK;
    throw new Error(message);
  }
}
