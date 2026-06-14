import { useQuery } from "@tanstack/react-query";

import { priceOfferQueryKeys } from "@/shared/api";

import { fetchIncomingPriceOffers } from "../api/incomingPriceOffersApi";

export const useIncomingPriceOffersQuery = (enabled = true) =>
  useQuery({
    queryKey: priceOfferQueryKeys.incoming(),
    queryFn: fetchIncomingPriceOffers,
    enabled,
  });
