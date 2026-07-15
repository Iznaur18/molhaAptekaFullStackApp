import { useQuery } from "@tanstack/react-query";

import { priceOfferQueryKeys } from "@/shared/api";

import { fetchMyPriceOfferBids, type MyPriceOfferBid } from "../api/incomingPriceOffersApi";

const PRICE_OFFER_STATUS_ACCEPTED = "accepted";

/** Принятые продавцом, но ещё не оплаченные ставки — лоты в корзине покупателя. */
export const useMyAcceptedBidsQuery = (enabled = true) =>
  useQuery({
    queryKey: priceOfferQueryKeys.myBids(),
    queryFn: fetchMyPriceOfferBids,
    enabled,
    select: (bids: MyPriceOfferBid[]) =>
      bids.filter((bid) => bid.status === PRICE_OFFER_STATUS_ACCEPTED),
  });
