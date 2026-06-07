import { useMutation, useQueryClient } from "@tanstack/react-query";

import { resolveDataConfirmationRequest } from "../api/resolveDataConfirmationRequest.js";
import { invalidatePendingDataConfirmationRequests } from "../lib/pendingDataConfirmationQueryCache.js";

export function useResolveDataConfirmationRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, body }) => resolveDataConfirmationRequest(requestId, body),
    onSuccess: () => {
      void invalidatePendingDataConfirmationRequests(queryClient);
    },
  });
}
