import { useQuery } from "@tanstack/react-query";

import { fetchUserPurchases } from "../api/fetchUserPurchases.js";
import { userPurchasesQueryKeys } from "./userPurchasesQueryKeys.js";

/**
 * @param {{ userId: string; enabled?: boolean }} params
 */
export function useUserPurchasesQuery({ userId, enabled = true }) {
  return useQuery({
    queryKey: userPurchasesQueryKeys.byUserId(userId),
    enabled: enabled && Boolean(userId),
    queryFn: () => fetchUserPurchases(userId),
  });
}
