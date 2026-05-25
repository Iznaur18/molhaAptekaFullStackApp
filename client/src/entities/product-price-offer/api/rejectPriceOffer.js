import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 * @param {string} offerId
 */
export async function rejectPriceOffer(productId, offerId) {
  try {
    const { data } = await apiClient.patch(
      `/product/${productId}/price-offers/${offerId}/reject`,
    );

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.REJECT_PRICE_OFFER_FALLBACK;
    throw new Error(message);
  }
}
