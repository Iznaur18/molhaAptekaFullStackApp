import { useQuery } from "@tanstack/react-query";

import { fetchUserPurchases } from "../api/fetchUserPurchases";
import { userPurchasesQueryKeys } from "./userPurchasesQueryKeys";

type UseUserPurchasesQueryOptions = {
  userId: string;
  enabled?: boolean;
};

export const useUserPurchasesQuery = ({ userId, enabled = true }: UseUserPurchasesQueryOptions) => {
  const normalizedUserId = userId.trim();

  return useQuery({
    queryKey: userPurchasesQueryKeys.byUserId(normalizedUserId),
    enabled: enabled && normalizedUserId.length > 0,
    queryFn: () => fetchUserPurchases(normalizedUserId),
  });
};
