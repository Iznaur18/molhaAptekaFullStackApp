import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `GET /price-offers/my-bids`
 *
 * @returns {Promise<import('../model/types.js').PriceOfferBuyerBidRow[]>}
 */
export async function fetchMyPriceOfferBids() {
  try {
    const { data } = await apiClient.get("/price-offers/my-bids");

    if (!data?.success || !Array.isArray(data.data?.bids)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.bids;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_MY_PRICE_OFFER_BIDS_FALLBACK;
    throw new Error(message);
  }
}
