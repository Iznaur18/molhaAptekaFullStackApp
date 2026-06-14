import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchPendingDataConfirmationRequests,
  resolveDataConfirmationRequest,
} from "@/entities/user-data-confirmation/api/dataConfirmationStaffApi";
import { dataConfirmationStaffQueryKeys } from "@/shared/api";

export const usePendingDataConfirmationRequestsQuery = (enabled = true) =>
  useQuery({
    queryKey: dataConfirmationStaffQueryKeys.pending(),
    queryFn: fetchPendingDataConfirmationRequests,
    enabled,
  });

export const useResolveDataConfirmationRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      body,
    }: {
      requestId: string;
      body: { resolution: string; staffNote?: string };
    }) => resolveDataConfirmationRequest(requestId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dataConfirmationStaffQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["data-confirmation"] });
    },
  });
};
