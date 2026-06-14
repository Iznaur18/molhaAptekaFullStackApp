import { useMutation, useQueryClient } from "@tanstack/react-query";

import { unfollowUser } from "../api/userFollowApi";
import { followingQueryKeys } from "./followingQueryKeys";

export const useUnfollowUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unfollowUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: followingQueryKeys.all });
    },
  });
};
