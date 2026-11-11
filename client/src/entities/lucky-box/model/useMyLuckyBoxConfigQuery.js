import { useQuery } from "@tanstack/react-query";

import { fetchMyLuckyBoxConfig } from "../api/luckyBoxApi.js";
import { luckyBoxQueryKeys } from "./luckyBoxQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [opts]
 */
export function useMyLuckyBoxConfigQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: luckyBoxQueryKeys.myConfig(),
    queryFn: fetchMyLuckyBoxConfig,
    enabled,
    staleTime: 30_000,
  });
}
