import { useQuery } from "@tanstack/react-query";

import { fetchSellerPriceOffers } from "../api/fetchSellerPriceOffers.js";
import { priceOfferQueryKeys } from "./priceOfferQueryKeys.js";

/**
 * @param {{ productId: string; enabled?: boolean }} params
 */
export function useSellerPriceOffersQuery({ productId, enabled = true }) {
  const normalizedProductId = productId.trim();

  return useQuery({
    queryKey: priceOfferQueryKeys.seller(normalizedProductId),
    enabled: enabled && normalizedProductId.length > 0,
    queryFn: () => fetchSellerPriceOffers(normalizedProductId),
  });
}
