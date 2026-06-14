import { useMutation } from "@tanstack/react-query";

import { submitUserVoteRating } from "../api/submitUserVoteRating";

type SubmitVoteInput = {
  targetUserId: string;
  score: number;
};

export const useSubmitUserVoteRatingMutation = () => {
  return useMutation({
    mutationFn: ({ targetUserId, score }: SubmitVoteInput) =>
      submitUserVoteRating(targetUserId, score),
  });
};
