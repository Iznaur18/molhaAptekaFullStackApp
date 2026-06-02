import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `GET /price-offers/incoming`
 *
 * @returns {Promise<import('../model/types.js').PriceOfferIncomingRow[]>}
 */
export async function fetchIncomingPriceOffers() {
  try {
    const { data } = await apiClient.get("/price-offers/incoming");

    if (!data?.success || !Array.isArray(data.data?.offers)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.offers;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_INCOMING_PRICE_OFFERS_FALLBACK;
    throw new Error(message);
  }
}
