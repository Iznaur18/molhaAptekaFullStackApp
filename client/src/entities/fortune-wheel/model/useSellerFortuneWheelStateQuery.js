import { useQuery } from "@tanstack/react-query";

import { fetchSellerFortuneWheelState } from "../api/fortuneWheelApi.js";
import { fortuneWheelQueryKeys } from "./fortuneWheelQueryKeys.js";

/**
 * @param {{ sellerId: string; enabled?: boolean }} opts
 */
export function useSellerFortuneWheelStateQuery({ sellerId, enabled = true }) {
  const id = String(sellerId ?? "").trim();
  return useQuery({
    queryKey: fortuneWheelQueryKeys.stateBySeller(id),
    queryFn: () => fetchSellerFortuneWheelState(id),
    enabled: enabled && Boolean(id),
    staleTime: 30_000,
  });
}
