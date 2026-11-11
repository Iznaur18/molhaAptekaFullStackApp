import { useQuery } from "@tanstack/react-query";

import { fetchMyLuckyBoxWins } from "../api/luckyBoxApi.js";
import { luckyBoxQueryKeys } from "./luckyBoxQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [opts]
 */
export function useMyLuckyBoxWinsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: luckyBoxQueryKeys.myWins(),
    queryFn: fetchMyLuckyBoxWins,
    enabled,
    staleTime: 30_000,
  });
}
