import { useQuery } from "@tanstack/react-query";

import { fetchMyFollowers } from "../api/userFollowApi";
import { followersQueryKeys } from "./followersQueryKeys";

type UseMyFollowersQueryOptions = {
  enabled?: boolean;
  page?: number;
  limit?: number;
};

export const useMyFollowersQuery = ({
  enabled = true,
  page = 1,
  limit = 50,
}: UseMyFollowersQueryOptions = {}) =>
  useQuery({
    queryKey: followersQueryKeys.list({ page, limit }),
    queryFn: () => fetchMyFollowers({ page, limit }),
    enabled,
  });
