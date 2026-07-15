import { PRICE_OFFER_STATUS_ACCEPTED } from "../model/constants.js";

/**
 * Принятые продавцом, но ещё не оплаченные ставки покупателя — они лежат в корзине.
 *
 * @param {import('../model/types.js').PriceOfferBuyerBidRow[] | undefined} bids
 * @returns {import('../model/types.js').PriceOfferBuyerBidRow[]}
 */
export function selectAcceptedPriceOfferBids(bids) {
  if (!Array.isArray(bids)) {
    return [];
  }
  return bids.filter((bid) => bid.status === PRICE_OFFER_STATUS_ACCEPTED);
}
