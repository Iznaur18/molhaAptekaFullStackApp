import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 */
export async function fetchTopPriceOffers(productId) {
  try {
    const { data } = await apiClient.get(`/product/${productId}/price-offers/top`);

    if (!data?.success || !Array.isArray(data.data?.top)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.top;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_PRICE_OFFERS_TOP_FALLBACK;
    throw new Error(message);
  }
}
