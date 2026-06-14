import { useQuery } from "@tanstack/react-query";

import { loyaltyPointsQueryKeys } from "@/shared/api";

import { fetchMyLoyaltyPointsStatus } from "../api/fetchMyLoyaltyPointsStatus";

export const useMyLoyaltyPointsStatusQuery = (enabled = true) =>
  useQuery({
    queryKey: loyaltyPointsQueryKeys.status(),
    queryFn: fetchMyLoyaltyPointsStatus,
    enabled,
  });
