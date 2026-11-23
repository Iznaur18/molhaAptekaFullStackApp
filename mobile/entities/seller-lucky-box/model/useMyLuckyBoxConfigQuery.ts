import { useQuery } from "@tanstack/react-query";

import { fetchMyLuckyBoxConfig } from "../api/luckyBoxApi";
import { luckyBoxQueryKeys } from "./luckyBoxQueryKeys";

/** Паритет web `useMyLuckyBoxConfigQuery`. */
export function useMyLuckyBoxConfigQuery({
  enabled = true,
}: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: luckyBoxQueryKeys.myConfig(),
    queryFn: fetchMyLuckyBoxConfig,
    enabled,
    staleTime: 30_000,
  });
}