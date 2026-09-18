import { useQuery } from "@tanstack/react-query";

import { fetchMyFollowers } from "../api/fetchMyFollowers.js";
import { MY_FOLLOW_LIST_DEFAULT_LIMIT } from "./constants.js";
import { followersQueryKeys } from "./followersQueryKeys.js";

const DEFAULT_PAGE = 1;

/**
 * @param {{ page?: number; limit?: number; enabled?: boolean }} [params]
 */
export function useMyFollowersQuery({
  page = DEFAULT_PAGE,
  limit = MY_FOLLOW_LIST_DEFAULT_LIMIT,
  enabled = true,
} = {}) {
  const params = { page, limit };

  return useQuery({
    queryKey: followersQueryKeys.list(params),
    enabled,
    queryFn: () => fetchMyFollowers(params),
  });
}
