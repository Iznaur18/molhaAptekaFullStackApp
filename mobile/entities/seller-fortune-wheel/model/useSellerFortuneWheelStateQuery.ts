import { useQuery } from "@tanstack/react-query";

import { fetchSellerFortuneWheelState } from "../api/fortuneWheelApi";
import { fortuneWheelQueryKeys } from "./fortuneWheelQueryKeys";

/** Паритет web `useSellerFortuneWheelStateQuery`. */
export function useSellerFortuneWheelStateQuery({
  sellerId,
  enabled = true,
}: {
  sellerId: string;
  enabled?: boolean;
}) {
  const id = String(sellerId ?? "").trim();
  return useQuery({
    queryKey: fortuneWheelQueryKeys.stateBySeller(id),
    queryFn: () => fetchSellerFortuneWheelState(id),
    enabled: enabled && Boolean(id),
    staleTime: 30_000,
  });
}
