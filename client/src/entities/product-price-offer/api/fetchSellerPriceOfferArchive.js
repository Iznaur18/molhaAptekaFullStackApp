import { apiClient } from "../../../shared/api/apiClient.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 * @returns {Promise<import('../model/types.js').PriceOfferRow[]>}
 */
export async function fetchSellerPriceOfferArchive(productId) {
  const { data } = await apiClient.get(`/product/${productId}/price-offers/archive`);
  const offers = data?.offers;
  if (!Array.isArray(offers)) {
    throw new Error(API_CLIENT_UI.FETCH_SELLER_PRICE_OFFERS_FALLBACK);
  }
  return offers;
}
