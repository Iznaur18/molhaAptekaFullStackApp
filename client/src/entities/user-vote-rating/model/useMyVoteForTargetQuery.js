import { useQuery } from "@tanstack/react-query";

import { fetchMyVoteForTarget } from "../api/fetchMyVoteForTarget.js";
import { userVoteQueryKeys } from "./userVoteQueryKeys.js";

/**
 * @param {{ targetUserId: string; enabled?: boolean }} params
 */
export function useMyVoteForTargetQuery({ targetUserId, enabled = true }) {
  return useQuery({
    queryKey: userVoteQueryKeys.myForTarget(targetUserId),
    enabled: enabled && Boolean(targetUserId),
    queryFn: () => fetchMyVoteForTarget(targetUserId),
  });
}
