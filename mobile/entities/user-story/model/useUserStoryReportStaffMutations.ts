import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchPendingUserStoryReports,
  resolveUserStoryReports,
} from "@/entities/user-story/api/userStoryReportStaffApi";
import { userStoryReportQueryKeys } from "@/shared/api";

export const usePendingUserStoryReportsQuery = (enabled = true) =>
  useQuery({
    queryKey: userStoryReportQueryKeys.pending(),
    queryFn: fetchPendingUserStoryReports,
    enabled,
  });

export const useResolveUserStoryReportsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storyId,
      body,
    }: {
      storyId: string;
      body: { resolution: string; staffNote: string };
    }) => resolveUserStoryReports(storyId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userStoryReportQueryKeys.all });
    },
  });
};
