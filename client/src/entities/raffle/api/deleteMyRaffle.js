import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} raffleId
 */
export async function deleteMyRaffle(raffleId) {
  try {
    const { data } = await apiClient.delete(`/product/raffles/my/${raffleId}`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.DELETE_RAFFLE_FALLBACK;
    throw new Error(message);
  }
}
