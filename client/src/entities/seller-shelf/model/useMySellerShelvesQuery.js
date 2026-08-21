import { useQuery } from "@tanstack/react-query";

import { fetchMySellerShelves } from "../api/sellerShelfApi.js";
import { sellerShelfQueryKeys } from "./sellerShelfQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [opts]
 */
export function useMySellerShelvesQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: sellerShelfQueryKeys.mine(),
    queryFn: fetchMySellerShelves,
    enabled,
    staleTime: 30_000,
  });
}
