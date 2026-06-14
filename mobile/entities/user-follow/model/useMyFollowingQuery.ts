import { useQuery } from "@tanstack/react-query";

import { fetchMyFollowing } from "../api/userFollowApi";
import { followingQueryKeys } from "./followingQueryKeys";

type UseMyFollowingQueryOptions = {
  enabled?: boolean;
  page?: number;
  limit?: number;
};

export const useMyFollowingQuery = ({
  enabled = true,
  page = 1,
  limit = 50,
}: UseMyFollowingQueryOptions = {}) =>
  useQuery({
    queryKey: followingQueryKeys.list({ page, limit }),
    queryFn: () => fetchMyFollowing({ page, limit }),
    enabled,
  });
