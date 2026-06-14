import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userStoriesQueryKeys } from "@/shared/api";

import { createUserStory } from "../api/createUserStory";
import { deleteUserStory } from "../api/deleteUserStory";
import { submitUserStoryReport } from "../api/submitUserStoryReport";

export const useUserStoryMutations = () => {
  const queryClient = useQueryClient();

  const invalidateStories = () => {
    void queryClient.invalidateQueries({ queryKey: userStoriesQueryKeys.all });
  };

  const createMutation = useMutation({
    mutationFn: createUserStory,
    onSuccess: invalidateStories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUserStory,
    onSuccess: invalidateStories,
  });

  const reportMutation = useMutation({
    mutationFn: ({
      storyId,
      body,
    }: {
      storyId: string;
      body: { reportText: string };
    }) => submitUserStoryReport(storyId, body),
  });

  return {
    createMutation,
    deleteMutation,
    reportMutation,
  };
};
