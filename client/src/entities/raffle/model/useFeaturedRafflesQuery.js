import { useQuery } from "@tanstack/react-query";

import { fetchFeaturedRaffles } from "../api/fetchFeaturedRaffle.js";
import { raffleQueryKeys } from "./raffleQueryKeys.js";

/**
 * @param {{ enabled: boolean; regionCode?: string }} params
 */
export function useFeaturedRafflesQuery({ enabled, regionCode = "" }) {
  return useQuery({
    queryKey: raffleQueryKeys.featured(regionCode),
    enabled,
    queryFn: () => fetchFeaturedRaffles({ regionCode: regionCode || undefined }),
  });
}
