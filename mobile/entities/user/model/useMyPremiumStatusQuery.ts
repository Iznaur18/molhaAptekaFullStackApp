import { useQuery } from "@tanstack/react-query";

import { premiumQueryKeys } from "@/shared/api";

import { fetchMyPremiumStatus } from "../api/fetchMyPremiumStatus";

export const useMyPremiumStatusQuery = (enabled = true) =>
  useQuery({
    queryKey: premiumQueryKeys.status(),
    queryFn: fetchMyPremiumStatus,
    enabled,
  });
