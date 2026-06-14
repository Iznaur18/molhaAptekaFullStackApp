import { useMutation, useQueryClient } from "@tanstack/react-query";

import { followUser, unfollowUser } from "../api/userFollowApi";
import { followingQueryKeys } from "../model/followingQueryKeys";

export const useUserFollowMutations = () => {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: followUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: followingQueryKeys.all });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: unfollowUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: followingQueryKeys.all });
    },
  });

  return { followMutation, unfollowMutation };
};
