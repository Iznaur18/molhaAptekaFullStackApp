import { useQuery } from "@tanstack/react-query";

import { fetchSellerLuckyBoxState } from "../api/luckyBoxApi.js";
import { luckyBoxQueryKeys } from "./luckyBoxQueryKeys.js";

/**
 * @param {{ sellerId: string; enabled?: boolean }} opts
 */
export function useSellerLuckyBoxStateQuery({ sellerId, enabled = true }) {
  const id = String(sellerId ?? "").trim();
  return useQuery({
    queryKey: luckyBoxQueryKeys.stateBySeller(id),
    queryFn: () => fetchSellerLuckyBoxState(id),
    enabled: enabled && Boolean(id),
    staleTime: 30_000,
  });
}
