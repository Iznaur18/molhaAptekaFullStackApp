import { useQuery } from "@tanstack/react-query";

import { fetchFeaturedRaffles } from "../api/fetchFeaturedRaffle.js";
import { raffleQueryKeys } from "./raffleQueryKeys.js";

/**
 * @param {{ enabled: boolean }} params
 */
export function useFeaturedRafflesQuery({ enabled }) {
  return useQuery({
    queryKey: raffleQueryKeys.featured(),
    enabled,
    queryFn: fetchFeaturedRaffles,
  });
}
