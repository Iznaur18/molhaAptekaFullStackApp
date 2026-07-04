import { bidNeedsAttention, offerNeedsAttention } from "./auctionDashboardAttention.js";

/**
 * @param {import("../model/types.js").PriceOfferBuyerBidRow[]} buyerBids
 * @param {import("../model/types.js").PriceOfferIncomingRow[]} sellerOffers
 */
export function summarizeAuctionDashboard(buyerBids, sellerOffers) {
  const buyerAttentionCount = buyerBids.filter(bidNeedsAttention).length;
  const sellerAttentionCount = sellerOffers.filter(offerNeedsAttention).length;

  return {
    buyerCount: buyerBids.length,
    sellerCount: sellerOffers.length,
    attentionCount: buyerAttentionCount + sellerAttentionCount,
    buyerAttentionCount,
    sellerAttentionCount,
  };
}
