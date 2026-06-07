import { useQuery } from "@tanstack/react-query";

import { fetchMyPremiumStatus } from "../api/fetchMyPremiumStatus.js";
import { premiumQueryKeys } from "./premiumQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function useMyPremiumStatusQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: premiumQueryKeys.all,
    enabled,
    queryFn: fetchMyPremiumStatus,
  });
}
