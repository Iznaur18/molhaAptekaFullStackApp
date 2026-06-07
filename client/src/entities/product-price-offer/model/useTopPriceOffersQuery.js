import { useQuery } from "@tanstack/react-query";

import { fetchTopPriceOffers } from "../api/fetchTopPriceOffers.js";
import { priceOfferQueryKeys } from "./priceOfferQueryKeys.js";

/**
 * @param {{ productId: string; enabled?: boolean }} params
 */
export function useTopPriceOffersQuery({ productId, enabled = true }) {
  return useQuery({
    queryKey: priceOfferQueryKeys.topForProduct(productId),
    enabled: enabled && Boolean(productId),
    queryFn: () => fetchTopPriceOffers(productId),
  });
}
