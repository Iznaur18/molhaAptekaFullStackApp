import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} raffleId
 * @param {{ comment?: string }} [body]
 */
export async function rejectRaffle(raffleId, body = {}) {
  try {
    const { data } = await apiClient.patch(`/product/raffles/${raffleId}/reject`, body);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data?.raffle ?? null;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.REJECT_RAFFLE_FALLBACK;
    throw new Error(message);
  }
}
