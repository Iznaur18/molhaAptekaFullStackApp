import { useMutation, useQuery } from "@tanstack/react-query";

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

export const useResolveDataConfirmationRequestMutation = () =>
  useMutation({
    mutationFn: ({
      requestId,
      body,
    }: {
      requestId: string;
      body: { resolution: string; staffNote?: string };
    }) => resolveDataConfirmationRequest(requestId, body),
  });
