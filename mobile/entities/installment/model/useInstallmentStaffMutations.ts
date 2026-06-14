import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  const invalidateModeration = () => {
    void queryClient.invalidateQueries({ queryKey: installmentQueryKeys.moderationPending() });
    void queryClient.invalidateQueries({ queryKey: installmentQueryKeys.moderationPendingCount() });
  };
  const invalidateDisputes = () => {
    void queryClient.invalidateQueries({ queryKey: installmentQueryKeys.disputesPending() });
    void queryClient.invalidateQueries({ queryKey: installmentQueryKeys.disputesPendingCount() });
  };

  const approveModerationMutation = useMutation({
    mutationFn: (productId: string) => approveInstallmentModeration(productId),
    onSuccess: invalidateModeration,
  });

  const rejectModerationMutation = useMutation({
    mutationFn: ({ productId, comment }: { productId: string; comment?: string }) =>
      rejectInstallmentModeration(productId, comment ?? ""),
    onSuccess: invalidateModeration,
  });

  const resolveDisputeMutation = useMutation({
    mutationFn: ({
      disputeId,
      body,
    }: {
      disputeId: string;
      body: { action: string; resolutionNote?: string; partialRefundRub?: number };
    }) => resolveInstallmentDispute(disputeId, body),
    onSuccess: invalidateDisputes,
  });

  return {
    approveModerationMutation,
    rejectModerationMutation,
    resolveDisputeMutation,
  };
};
