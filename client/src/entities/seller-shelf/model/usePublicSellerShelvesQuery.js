import { useQuery } from "@tanstack/react-query";

import { fetchPublicSellerShelves } from "../api/sellerShelfApi.js";
import { sellerShelfQueryKeys } from "./sellerShelfQueryKeys.js";

/**
 * @param {{ sellerId: string; enabled?: boolean }} opts
 */
export function usePublicSellerShelvesQuery({ sellerId, enabled = true }) {
  const id = String(sellerId ?? "").trim();
  return useQuery({
    queryKey: sellerShelfQueryKeys.publicBySeller(id),
    queryFn: () => fetchPublicSellerShelves(id),
    enabled: enabled && Boolean(id),
    staleTime: 30_000,
  });
}
