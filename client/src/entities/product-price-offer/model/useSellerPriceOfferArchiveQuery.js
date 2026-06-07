import { useQuery } from "@tanstack/react-query";

import { fetchSellerPriceOfferArchive } from "../api/fetchSellerPriceOfferArchive.js";
import { priceOfferQueryKeys } from "./priceOfferQueryKeys.js";

/**
 * @param {{ productId: string; enabled?: boolean }} params
 */
export function useSellerPriceOfferArchiveQuery({ productId, enabled = true }) {
  const normalizedProductId = productId.trim();

  return useQuery({
    queryKey: priceOfferQueryKeys.sellerArchive(normalizedProductId),
    enabled: enabled && normalizedProductId.length > 0,
    queryFn: () => fetchSellerPriceOfferArchive(normalizedProductId),
  });
}
