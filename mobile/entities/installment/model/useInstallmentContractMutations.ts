import { useMutation, useQueryClient } from "@tanstack/react-query";

import { installmentQueryKeys, staffBadgeQueryKeys } from "@/shared/api";
import { createClientIdempotencyKey } from "@/shared/lib/createClientIdempotencyKey";

import {
  cancelInstallmentEarlyPayoff,
  confirmInstallmentEarlyPayoff,
  confirmInstallmentPayment,
  markInstallmentEarlyPayoff,
  markInstallmentPaymentPaid,
  openInstallmentDispute,
  rejectInstallmentEarlyPayoff,
  rejectInstallmentPayment,
} from "../api/installmentApi";

const invalidateInstallmentQueues = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: installmentQueryKeys.all });
  void queryClient.invalidateQueries({
    queryKey: [...staffBadgeQueryKeys.all, "user-actions"],
  });
};

export const useInstallmentContractMutations = (contractId: string) => {
  const queryClient = useQueryClient();

  const invalidate = () => invalidateInstallmentQueues(queryClient);

  const markPaidMutation = useMutation({
    mutationFn: (paymentIndex: number) =>
      markInstallmentPaymentPaid(
        contractId,
        paymentIndex,
        createClientIdempotencyKey(),
      ),
    onSuccess: invalidate,
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: (paymentIndex: number) =>
      confirmInstallmentPayment(
        contractId,
        paymentIndex,
        createClientIdempotencyKey(),
      ),
    onSuccess: invalidate,
  });

  const rejectPaymentMutation = useMutation({
    mutationFn: (paymentIndex: number) =>
      rejectInstallmentPayment(
        contractId,
        paymentIndex,
        createClientIdempotencyKey(),
      ),
    onSuccess: invalidate,
  });

  const markEarlyPayoffMutation = useMutation({
    mutationFn: () =>
      markInstallmentEarlyPayoff(contractId, createClientIdempotencyKey()),
    onSuccess: invalidate,
  });

  const confirmEarlyPayoffMutation = useMutation({
    mutationFn: () =>
      confirmInstallmentEarlyPayoff(contractId, createClientIdempotencyKey()),
    onSuccess: invalidate,
  });

  const cancelEarlyPayoffMutation = useMutation({
    mutationFn: () =>
      cancelInstallmentEarlyPayoff(contractId, createClientIdempotencyKey()),
    onSuccess: invalidate,
  });

  const rejectEarlyPayoffMutation = useMutation({
    mutationFn: () =>
      rejectInstallmentEarlyPayoff(contractId, createClientIdempotencyKey()),
    onSuccess: invalidate,
  });

  const openDisputeMutation = useMutation({
    mutationFn: (reason: string) => openInstallmentDispute(contractId, reason),
    onSuccess: invalidate,
  });

  return {
    markPaidMutation,
    confirmPaymentMutation,
    rejectPaymentMutation,
    markEarlyPayoffMutation,
    confirmEarlyPayoffMutation,
    cancelEarlyPayoffMutation,
    rejectEarlyPayoffMutation,
    openDisputeMutation,
  };
};
