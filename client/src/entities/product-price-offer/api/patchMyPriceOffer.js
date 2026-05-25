import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 * @param {number} offerPrice
 */
export async function patchMyPriceOffer(productId, offerPrice) {
  try {
    const { data } = await apiClient.patch(
      `/product/${productId}/price-offers/me`,
      { offerPrice },
    );

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.offer;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.SUBMIT_PRICE_OFFER_FALLBACK;
    throw new Error(message);
  }
}
