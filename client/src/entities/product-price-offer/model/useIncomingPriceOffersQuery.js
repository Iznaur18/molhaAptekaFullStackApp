import { useQuery } from "@tanstack/react-query";

import { fetchIncomingPriceOffers } from "../api/fetchIncomingPriceOffers.js";
import { priceOfferQueryKeys } from "./priceOfferQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function useIncomingPriceOffersQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: priceOfferQueryKeys.incoming(),
    enabled,
    queryFn: fetchIncomingPriceOffers,
  });
}
