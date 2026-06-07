import { useQuery } from "@tanstack/react-query";

import {
  fetchUserProducts,
  USER_PROFILE_PRODUCTS_PAGE_SIZE,
} from "../api/fetchUserProducts.js";
import { userProfileProductsQueryKeys } from "./userProfileProductsQueryKeys.js";

/**
 * @param {{
 *   userId: string;
 *   page?: number;
 *   limit?: number;
 *   enabled?: boolean;
 * }} params
 */
export function useUserProfileProductsQuery({
  userId,
  page = 1,
  limit = USER_PROFILE_PRODUCTS_PAGE_SIZE,
  enabled = true,
}) {
  const normalizedUserId = userId.trim();
  const params = { page, limit };

  return useQuery({
    queryKey: userProfileProductsQueryKeys.list(normalizedUserId, params),
    enabled: enabled && normalizedUserId.length > 0,
    queryFn: () => fetchUserProducts(normalizedUserId, params),
  });
}
