import type {
  IncomingPriceOffer,
  MyPriceOfferBid,
} from "@/entities/product-price-offer/api/incomingPriceOffersApi";
import { bidNeedsAttention, offerNeedsAttention } from "@/entities/product-price-offer/lib/auctionDashboardAttention";

export const summarizeAuctionDashboard = (
  buyerBids: MyPriceOfferBid[],
  sellerOffers: IncomingPriceOffer[],
) => {
  const buyerAttentionCount = buyerBids.filter(bidNeedsAttention).length;
  const sellerAttentionCount = sellerOffers.filter(offerNeedsAttention).length;

  return {
    buyerCount: buyerBids.length,
    sellerCount: sellerOffers.length,
    attentionCount: buyerAttentionCount + sellerAttentionCount,
    buyerAttentionCount,
    sellerAttentionCount,
  };
};
