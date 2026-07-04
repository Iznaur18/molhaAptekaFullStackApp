import type {
  IncomingPriceOffer,
  MyPriceOfferBid,
} from "@/entities/product-price-offer/api/incomingPriceOffersApi";
import { bidNeedsAttention, offerNeedsAttention } from "@/entities/product-price-offer/lib/auctionDashboardAttention";
import {
  AUCTION_VIEW_FILTER_BUYER,
  AUCTION_VIEW_FILTER_SELLER,
} from "@/entities/product-price-offer/model/auctionViewFilters";

type FilterAuctionDashboardParams = {
  viewFilter?: string;
  attentionOnly?: boolean;
};

export const filterAuctionDashboard = (
  buyerBids: MyPriceOfferBid[],
  sellerOffers: IncomingPriceOffer[],
  { viewFilter = "", attentionOnly = false }: FilterAuctionDashboardParams,
) => {
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
};
