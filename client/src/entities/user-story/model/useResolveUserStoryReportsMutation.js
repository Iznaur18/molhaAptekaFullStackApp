import { useMutation, useQueryClient } from "@tanstack/react-query";

import { resolveUserStoryReports } from "../api/resolveUserStoryReports.js";
import { invalidateUserStoryReportQueries } from "../lib/userStoryReportQueryCache.js";

export function useResolveUserStoryReportsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storyId, body }) => resolveUserStoryReports(storyId, body),
    onSuccess: () => {
      void invalidateUserStoryReportQueries(queryClient);
    },
  });
}
