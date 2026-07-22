import { useQuery } from "@tanstack/react-query";

import { loyaltyPointsQueryKeys } from "@/shared/api";

import { fetchUsersMonthlyLoyaltyPoints } from "../api/fetchUsersMonthlyLoyaltyPoints";

type UseUsersMonthlyLoyaltyPointsQueryOptions = {
  enabled?: boolean;
};

export const useUsersMonthlyLoyaltyPointsQuery = ({
  enabled = true,
}: UseUsersMonthlyLoyaltyPointsQueryOptions = {}) =>
  useQuery({
    queryKey: loyaltyPointsQueryKeys.monthlyAwarded(),
    queryFn: fetchUsersMonthlyLoyaltyPoints,
    enabled,
  });
