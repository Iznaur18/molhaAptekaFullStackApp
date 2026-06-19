import { useQuery } from "@tanstack/react-query";

import { fetchAllUserProducts } from "../api/fetchUserProducts";
import { userProfileProductsQueryKeys } from "./userProfileProductsQueryKeys";

type UseUserProfileProductsAllPagesQueryOptions = {
  userId: string;
  enabled?: boolean;
};

export const useUserProfileProductsAllPagesQuery = ({
  userId,
  enabled = false,
}: UseUserProfileProductsAllPagesQueryOptions) => {
  const normalizedUserId = userId.trim();

  return useQuery({
    queryKey: userProfileProductsQueryKeys.allPages(normalizedUserId),
    enabled: enabled && normalizedUserId.length > 0,
    queryFn: () => fetchAllUserProducts(normalizedUserId),
  });
};
