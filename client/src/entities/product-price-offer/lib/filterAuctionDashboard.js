import { bidNeedsAttention, offerNeedsAttention } from "./auctionDashboardAttention.js";
import {
  AUCTION_VIEW_FILTER_BUYER,
  AUCTION_VIEW_FILTER_SELLER,
} from "../model/auctionViewFilters.js";

/**
 * @param {import("../model/types.js").PriceOfferBuyerBidRow[]} buyerBids
 * @param {import("../model/types.js").PriceOfferIncomingRow[]} sellerOffers
 * @param {{ viewFilter?: string; attentionOnly?: boolean }} filters
 */
export function filterAuctionDashboard(
  buyerBids,
  sellerOffers,
  { viewFilter = "", attentionOnly = false },
) {
  let bids = buyerBids;
  let offers = sellerOffers;

  if (attentionOnly) {
    bids = bids.filter(bidNeedsAttention);
    offers = offers.filter(offerNeedsAttention);
  }

  if (viewFilter === AUCTION_VIEW_FILTER_BUYER) {
    offers = [];
  } else if (viewFilter === AUCTION_VIEW_FILTER_SELLER) {
    bids = [];
  }

  return { buyerBids: bids, sellerOffers: offers };
}
