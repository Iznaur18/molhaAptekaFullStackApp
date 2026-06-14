import { useQuery } from "@tanstack/react-query";

import {
  fetchUserProducts,
  USER_PROFILE_PRODUCTS_PAGE_SIZE,
} from "../api/fetchUserProducts";
import { userProfileProductsQueryKeys } from "./userProfileProductsQueryKeys";

type UseUserProfileProductsQueryOptions = {
  userId: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
};

export const useUserProfileProductsQuery = ({
  userId,
  page = 1,
  limit = USER_PROFILE_PRODUCTS_PAGE_SIZE,
  enabled = true,
}: UseUserProfileProductsQueryOptions) => {
  const normalizedUserId = userId.trim();
  const params = { page, limit };

  return useQuery({
    queryKey: userProfileProductsQueryKeys.list(normalizedUserId, params),
    enabled: enabled && normalizedUserId.length > 0,
    queryFn: () => fetchUserProducts(normalizedUserId, params),
  });
};
