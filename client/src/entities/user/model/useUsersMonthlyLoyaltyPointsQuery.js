import { useQuery } from "@tanstack/react-query";

import { fetchUsersMonthlyLoyaltyPoints } from "../api/fetchUsersMonthlyLoyaltyPoints.js";
import { usersMonthlyLoyaltyQueryKeys } from "./usersMonthlyLoyaltyQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [options]
 */
export function useUsersMonthlyLoyaltyPointsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: usersMonthlyLoyaltyQueryKeys.monthlyAwarded(),
    queryFn: fetchUsersMonthlyLoyaltyPoints,
    enabled,
  });
}
