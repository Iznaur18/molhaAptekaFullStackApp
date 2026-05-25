import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 */
export async function fetchSellerPriceOffers(productId) {
  try {
    const { data } = await apiClient.get(`/product/${productId}/price-offers`);

    if (!data?.success || !Array.isArray(data.data?.offers)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.offers;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_SELLER_PRICE_OFFERS_FALLBACK;
    throw new Error(message);
  }
}
