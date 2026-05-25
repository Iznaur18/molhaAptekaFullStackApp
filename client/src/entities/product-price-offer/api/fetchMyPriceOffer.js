import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 */
export async function fetchMyPriceOffer(productId) {
  try {
    const { data } = await apiClient.get(
      `/product/${productId}/price-offers/me`,
    );

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.offer ?? null;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_PRICE_OFFER_FALLBACK;
    throw new Error(message);
  }
}
