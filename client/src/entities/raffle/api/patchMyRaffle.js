import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} raffleId
 * @param {Record<string, unknown>} body
 */
export async function patchMyRaffle(raffleId, body) {
  try {
    const { data } = await apiClient.patch(`/product/raffles/${raffleId}`, body);
    if (!data?.success || !data.data?.raffle) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.raffle;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.PATCH_RAFFLE_FALLBACK;
    throw new Error(message);
  }
}
