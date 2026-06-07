import { useMutation, useQueryClient } from "@tanstack/react-query";

import { submitDataConfirmationRequest } from "../api/submitDataConfirmationRequest.js";
import { invalidateDataConfirmationStatus } from "../lib/dataConfirmationQueryCache.js";

export function useSubmitDataConfirmationRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitDataConfirmationRequest,
    onSuccess: () => {
      void invalidateDataConfirmationStatus(queryClient);
    },
  });
}
