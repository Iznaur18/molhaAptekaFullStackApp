import { AUCTION_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import {
  PRICE_OFFER_STATUS_ACCEPTED,
  PRICE_OFFER_STATUS_PENDING,
} from "../model/constants.js";

/**
 * @param {import("../model/types.js").PriceOfferBuyerBidRow} bid
 */
export function bidNeedsAttention(bid) {
  return bid.status === PRICE_OFFER_STATUS_ACCEPTED;
}

/**
 * @param {import("../model/types.js").PriceOfferIncomingRow} offer
 */
export function offerNeedsAttention(offer) {
  return offer.status === PRICE_OFFER_STATUS_PENDING;
}

/**
 * @param {import("../model/types.js").PriceOfferBuyerBidRow} bid
 */
export function resolveBuyerBidCollapsedPreview(bid) {
  if (bid.status === PRICE_OFFER_STATUS_ACCEPTED) {
    return AUCTION_PAGE_UI.COLLAPSED_BUYER_PAY(formatPriceRub(bid.offerPrice));
  }
  if (bid.status === PRICE_OFFER_STATUS_PENDING) {
    return AUCTION_PAGE_UI.COLLAPSED_BUYER_PENDING;
  }
  return null;
}

/**
 * @param {import("../model/types.js").PriceOfferIncomingRow} offer
 */
export function resolveSellerOfferCollapsedPreview(offer) {
  if (offer.status === PRICE_OFFER_STATUS_PENDING) {
    return AUCTION_PAGE_UI.COLLAPSED_SELLER_REVIEW(formatPriceRub(offer.offerPrice));
  }
  return null;
}
