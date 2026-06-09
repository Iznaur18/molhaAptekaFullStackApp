import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createUserStory } from "../api/createUserStory.js";
import { deleteUserStory } from "../api/deleteUserStory.js";
import { markUserStoryViewed } from "../api/markUserStoryViewed.js";
import { submitUserStoryReport } from "../api/submitUserStoryReport.js";
import { userStoriesQueryKeys } from "./userStoriesQueryKeys.js";

export function useUserStoryMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createUserStory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userStoriesQueryKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUserStory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userStoriesQueryKeys.all });
    },
  });

  const markViewedMutation = useMutation({
    mutationFn: markUserStoryViewed,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userStoriesQueryKeys.feed() });
    },
  });

  const reportMutation = useMutation({
    mutationFn: ({ storyId, body }) => submitUserStoryReport(storyId, body),
  });

  return {
    createMutation,
    deleteMutation,
    markViewedMutation,
    reportMutation,
  };
}
