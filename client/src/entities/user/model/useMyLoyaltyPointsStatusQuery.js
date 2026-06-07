import { useQuery } from "@tanstack/react-query";

import { fetchMyLoyaltyPointsStatus } from "../api/fetchMyLoyaltyPointsStatus.js";
import { loyaltyPointsQueryKeys } from "./loyaltyPointsQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function useMyLoyaltyPointsStatusQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: loyaltyPointsQueryKeys.all,
    enabled,
    queryFn: fetchMyLoyaltyPointsStatus,
  });
}
