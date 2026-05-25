import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 */
export async function cancelMyPriceOffer(productId) {
  try {
    const { data } = await apiClient.delete(
      `/product/${productId}/price-offers/me`,
    );

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.SUBMIT_PRICE_OFFER_FALLBACK;
    throw new Error(message);
  }
}
