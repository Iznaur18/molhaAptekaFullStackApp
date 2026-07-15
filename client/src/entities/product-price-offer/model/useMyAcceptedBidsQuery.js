import { useQuery } from "@tanstack/react-query";

import { fetchMyPriceOfferBids } from "../api/fetchMyPriceOfferBids.js";
import { selectAcceptedPriceOfferBids } from "../lib/selectAcceptedPriceOfferBids.js";
import { priceOfferQueryKeys } from "./priceOfferQueryKeys.js";

/**
 * Принятые ставки текущего покупателя — то, что показывается как лоты в корзине.
 *
 * @param {{ enabled?: boolean }} [params]
 */
export function useMyAcceptedBidsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: priceOfferQueryKeys.myBids(),
    enabled,
    queryFn: fetchMyPriceOfferBids,
    select: selectAcceptedPriceOfferBids,
  });
}
