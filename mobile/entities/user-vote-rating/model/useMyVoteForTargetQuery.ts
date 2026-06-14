import { useQuery } from "@tanstack/react-query";

import { fetchMyVoteForTarget } from "../api/fetchMyVoteForTarget";
import { userVoteQueryKeys } from "./userVoteQueryKeys";

type UseMyVoteForTargetQueryOptions = {
  targetUserId: string;
  enabled?: boolean;
};

export const useMyVoteForTargetQuery = ({
  targetUserId,
  enabled = true,
}: UseMyVoteForTargetQueryOptions) => {
  return useQuery({
    queryKey: userVoteQueryKeys.myForTarget(targetUserId),
    enabled: enabled && Boolean(targetUserId),
    queryFn: () => fetchMyVoteForTarget(targetUserId),
  });
};
