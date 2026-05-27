import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 * @param {boolean} enabled
 */
export async function setProductRaffleParticipation(productId, enabled) {
  try {
    const { data } = await apiClient.patch(
      `/product/${productId}/raffle-participation`,
      { enabled },
    );
    if (!data?.success || !data.data?.product) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.product;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.SET_RAFFLE_PARTICIPATION_FALLBACK;
    throw new Error(message);
  }
}
