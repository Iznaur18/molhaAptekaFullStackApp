import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} raffleId
 */
export async function approveRaffle(raffleId) {
  try {
    const { data } = await apiClient.patch(`/product/raffles/${raffleId}/approve`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data?.raffle ?? null;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.APPROVE_RAFFLE_FALLBACK;
    throw new Error(message);
  }
}
