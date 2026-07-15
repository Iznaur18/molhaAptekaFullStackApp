import { useMutation, useQuery } from "@tanstack/react-query";

import {
  fetchPendingInstallmentDisputes,
  resolveInstallmentDispute,
} from "@/entities/installment/api/installmentStaffApi";
import { installmentQueryKeys } from "@/shared/api";

export const usePendingInstallmentDisputesQuery = (enabled = true) =>
  useQuery({
    queryKey: installmentQueryKeys.disputesPending(),
    queryFn: fetchPendingInstallmentDisputes,
    enabled,
  });

export const useInstallmentStaffMutations = () => {
  const resolveDisputeMutation = useMutation({
    mutationFn: ({
      disputeId,
      body,
    }: {
      disputeId: string;
      body: { action: string; resolutionNote?: string; partialRefundRub?: number };
    }) => resolveInstallmentDispute(disputeId, body),
  });

  return {
    resolveDisputeMutation,
  };
};
