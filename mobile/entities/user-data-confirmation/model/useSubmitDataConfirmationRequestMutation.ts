import { useMutation, useQueryClient } from "@tanstack/react-query";

import { dataConfirmationQueryKeys } from "@/shared/api";

import { submitDataConfirmationRequest } from "../api/submitDataConfirmationRequest";

export const useSubmitDataConfirmationRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitDataConfirmationRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dataConfirmationQueryKeys.myStatus() });
    },
  });
};
