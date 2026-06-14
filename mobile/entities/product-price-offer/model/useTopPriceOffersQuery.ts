import { useQuery } from "@tanstack/react-query";

import { priceOfferQueryKeys } from "@/shared/api";

import { fetchTopPriceOffers } from "../api/fetchTopPriceOffers";

export const useTopPriceOffersQuery = (productId: string, enabled = true) =>
  useQuery({
    queryKey: priceOfferQueryKeys.top(productId),
    queryFn: () => fetchTopPriceOffers(productId),
    enabled: Boolean(productId) && enabled,
  });
