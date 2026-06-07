import { useQuery } from "@tanstack/react-query";

import { fetchMyPriceOffer } from "../api/fetchMyPriceOffer.js";
import { priceOfferQueryKeys } from "./priceOfferQueryKeys.js";

/**
 * @param {{ productId: string; enabled?: boolean }} params
 */
export function useMyPriceOfferQuery({ productId, enabled = true }) {
  return useQuery({
    queryKey: priceOfferQueryKeys.myForProduct(productId),
    enabled: enabled && Boolean(productId),
    queryFn: () => fetchMyPriceOffer(productId),
  });
}
