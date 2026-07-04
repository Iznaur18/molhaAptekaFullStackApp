import type {
  IncomingPriceOffer,
  MyPriceOfferBid,
} from "@/entities/product-price-offer/api/incomingPriceOffersApi";
import { AUCTION_PAGE_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";

export const bidNeedsAttention = (bid: MyPriceOfferBid) => bid.status === "accepted";

export const offerNeedsAttention = (offer: IncomingPriceOffer) => offer.status === "pending";

export const resolveBuyerBidCollapsedPreview = (bid: MyPriceOfferBid) => {
  if (bid.status === "accepted") {
    return AUCTION_PAGE_UI.COLLAPSED_BUYER_PAY(formatPriceRub(bid.offerPrice));
  }
  if (bid.status === "pending") {
    return AUCTION_PAGE_UI.COLLAPSED_BUYER_PENDING;
  }
  return null;
};

export const resolveSellerOfferCollapsedPreview = (offer: IncomingPriceOffer) => {
  if (offer.status === "pending") {
    return AUCTION_PAGE_UI.COLLAPSED_SELLER_REVIEW(formatPriceRub(offer.offerPrice));
  }
  return null;
};
