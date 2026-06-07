import { useMutation, useQueryClient } from "@tanstack/react-query";

import { submitUserVoteRating } from "../api/submitUserVoteRating.js";
import { userVoteQueryKeys } from "./userVoteQueryKeys.js";

export function useSubmitUserVoteRatingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetUserId, score }) => submitUserVoteRating(targetUserId, score),
    onSuccess: (_data, { targetUserId, score }) => {
      queryClient.setQueryData(userVoteQueryKeys.myForTarget(targetUserId), score);
    },
  });
}
