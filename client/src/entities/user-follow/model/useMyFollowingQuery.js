import { useQuery } from "@tanstack/react-query";

import { fetchMyFollowing } from "../api/fetchMyFollowing.js";
import { followingQueryKeys } from "./followingQueryKeys.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

/**
 * @param {{ page?: number; limit?: number; enabled?: boolean }} [params]
 */
export function useMyFollowingQuery({
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
  enabled = true,
} = {}) {
  const params = { page, limit };

  return useQuery({
    queryKey: followingQueryKeys.list(params),
    enabled,
    queryFn: () => fetchMyFollowing(params),
  });
}
