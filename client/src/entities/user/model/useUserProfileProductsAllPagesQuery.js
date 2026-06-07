import { useQuery } from "@tanstack/react-query";

import { fetchAllUserProducts } from "../api/fetchUserProducts.js";
import { userProfileProductsQueryKeys } from "./userProfileProductsQueryKeys.js";

/**
 * @param {{ userId: string; enabled?: boolean }} params
 */
export function useUserProfileProductsAllPagesQuery({ userId, enabled = false }) {
  const normalizedUserId = userId.trim();

  return useQuery({
    queryKey: userProfileProductsQueryKeys.allPages(normalizedUserId),
    enabled: enabled && normalizedUserId.length > 0,
    queryFn: () => fetchAllUserProducts(normalizedUserId),
  });
}
