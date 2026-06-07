import { useQuery } from "@tanstack/react-query";

import { fetchMyPriceOfferBids } from "../api/fetchMyPriceOfferBids.js";
import { priceOfferQueryKeys } from "./priceOfferQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function useMyPriceOfferBidsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: priceOfferQueryKeys.myBids(),
    enabled,
    queryFn: fetchMyPriceOfferBids,
  });
}
