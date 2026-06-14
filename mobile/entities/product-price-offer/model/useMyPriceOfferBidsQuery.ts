import { useQuery } from "@tanstack/react-query";

import { priceOfferQueryKeys } from "@/shared/api";

import { fetchMyPriceOfferBids } from "../api/incomingPriceOffersApi";

export const useMyPriceOfferBidsQuery = (enabled = true) =>
  useQuery({
    queryKey: priceOfferQueryKeys.myBids(),
    queryFn: fetchMyPriceOfferBids,
    enabled,
  });
