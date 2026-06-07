import { useMutation, useQueryClient } from "@tanstack/react-query";

import { followUser } from "../api/followUser.js";
import { unfollowUser } from "../api/unfollowUser.js";
import { followingQueryKeys } from "./followingQueryKeys.js";

export function useUserFollowMutations() {
  const queryClient = useQueryClient();

  const invalidateFollowing = () =>
    void queryClient.invalidateQueries({ queryKey: followingQueryKeys.all });

  const followMutation = useMutation({
    mutationFn: (targetUserId) => followUser(targetUserId),
    onSuccess: invalidateFollowing,
  });

  const unfollowMutation = useMutation({
    mutationFn: (targetUserId) => unfollowUser(targetUserId),
    onSuccess: invalidateFollowing,
  });

  return {
    followMutation,
    unfollowMutation,
  };
}
