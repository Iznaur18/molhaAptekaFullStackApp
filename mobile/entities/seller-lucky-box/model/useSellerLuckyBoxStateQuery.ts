import { useQuery } from "@tanstack/react-query";

import { fetchSellerLuckyBoxState } from "../api/luckyBoxApi";
import { luckyBoxQueryKeys } from "./luckyBoxQueryKeys";

/** Паритет web `useSellerLuckyBoxStateQuery`. */
export function useSellerLuckyBoxStateQuery({
  sellerId,
  enabled = true,
}: {
  sellerId: string;
  enabled?: boolean;
}) {
  const id = String(sellerId ?? "").trim();
  return useQuery({
    queryKey: luckyBoxQueryKeys.stateBySeller(id),
    queryFn: () => fetchSellerLuckyBoxState(id),
    enabled: enabled && Boolean(id),
    staleTime: 30_000,
  });
}
