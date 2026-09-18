import { useQuery } from "@tanstack/react-query";

import { fetchMyStatsTrends } from "../api/fetchMyStatsTrends.js";
import { myStatsTrendsQueryKeys } from "./myStatsTrendsQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function useMyStatsTrendsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: myStatsTrendsQueryKeys.all,
    enabled,
    queryFn: fetchMyStatsTrends,
    staleTime: 60_000,
  });
}
