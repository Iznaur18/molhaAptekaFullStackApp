import { useMutation, useQuery } from "@tanstack/react-query";

import {
  approveInstallmentModeration,
  fetchPendingInstallmentDisputes,
  fetchPendingInstallmentModeration,
  rejectInstallmentModeration,
  resolveInstallmentDispute,
} from "@/entities/installment/api/installmentStaffApi";
import { installmentQueryKeys } from "@/shared/api";

export const usePendingInstallmentModerationQuery = (enabled = true) =>
  useQuery({
    queryKey: installmentQueryKeys.moderationPending(),
    queryFn: fetchPendingInstallmentModeration,
    enabled,
  });

export const usePendingInstallmentDisputesQuery = (enabled = true) =>
  useQuery({
    queryKey: installmentQueryKeys.disputesPending(),
    queryFn: fetchPendingInstallmentDisputes,
    enabled,
  });

export const useInstallmentStaffMutations = () => {
  const approveModerationMutation = useMutation({
    mutationFn: (productId: string) => approveInstallmentModeration(productId),
  });

  const rejectModerationMutation = useMutation({
    mutationFn: ({ productId, comment }: { productId: string; comment?: string }) =>
      rejectInstallmentModeration(productId, comment ?? ""),
  });

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
    approveModerationMutation,
    rejectModerationMutation,
    resolveDisputeMutation,
  };
};
