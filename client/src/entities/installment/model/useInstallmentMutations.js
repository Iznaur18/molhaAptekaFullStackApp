import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  cancelInstallmentEarlyPayoff,
  confirmInstallmentEarlyPayoff,
  confirmInstallmentPayment,
  createInstallmentContract,
  markInstallmentEarlyPayoff,
  markInstallmentPaymentPaid,
  openInstallmentDispute,
  rejectInstallmentEarlyPayoff,
  rejectInstallmentPayment,
  resolveInstallmentDispute,
  upsertProductInstallmentProgram,
} from "../api/installmentApi.js";
import {
  invalidateInstallmentDisputesPending,
  invalidateInstallmentQueries,
  invalidateInstallmentUserActionCounts,
} from "../lib/installmentQueryCache.js";
import { installmentQueryKeys } from "./installmentQueryKeys.js";

export function useInstallmentMutations() {
  const queryClient = useQueryClient();

  const invalidateInstallment = () => void invalidateInstallmentQueries(queryClient);

  const createContractMutation = useMutation({
    mutationFn: ({ productId, body }) => createInstallmentContract(productId, body),
    onSuccess: () => {
      invalidateInstallment();
      void invalidateInstallmentUserActionCounts(queryClient);
    },
  });

  const upsertProgramMutation = useMutation({
    mutationFn: ({ productId, body }) => upsertProductInstallmentProgram(productId, body),
    onSuccess: (_data, { productId }) => {
      invalidateInstallment();
      void queryClient.invalidateQueries({
        queryKey: installmentQueryKeys.program(productId),
      });
    },
  });

  const resolveDisputeMutation = useMutation({
    mutationFn: ({ disputeId, body }) => resolveInstallmentDispute(disputeId, body),
    onSuccess: () => {
      void invalidateInstallmentDisputesPending(queryClient);
      invalidateInstallment();
    },
  });

  return {
    createContractMutation,
    upsertProgramMutation,
    resolveDisputeMutation,
  };
}

/**
 * @param {string} contractId
 */
export function useInstallmentContractMutations(contractId) {
  const queryClient = useQueryClient();

  const invalidateInstallment = () => {
    void invalidateInstallmentQueries(queryClient);
    void invalidateInstallmentUserActionCounts(queryClient);
  };

  const markPaidMutation = useMutation({
    mutationFn: (paymentIndex) => markInstallmentPaymentPaid(contractId, paymentIndex),
    onSuccess: invalidateInstallment,
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: (paymentIndex) => confirmInstallmentPayment(contractId, paymentIndex),
    onSuccess: invalidateInstallment,
  });

  const rejectPaymentMutation = useMutation({
    mutationFn: (paymentIndex) => rejectInstallmentPayment(contractId, paymentIndex),
    onSuccess: invalidateInstallment,
  });

  const markEarlyPayoffMutation = useMutation({
    mutationFn: () => markInstallmentEarlyPayoff(contractId),
    onSuccess: invalidateInstallment,
  });

  const confirmEarlyPayoffMutation = useMutation({
    mutationFn: () => confirmInstallmentEarlyPayoff(contractId),
    onSuccess: invalidateInstallment,
  });

  const cancelEarlyPayoffMutation = useMutation({
    mutationFn: () => cancelInstallmentEarlyPayoff(contractId),
    onSuccess: invalidateInstallment,
  });

  const rejectEarlyPayoffMutation = useMutation({
    mutationFn: () => rejectInstallmentEarlyPayoff(contractId),
    onSuccess: invalidateInstallment,
  });

  const openDisputeMutation = useMutation({
    mutationFn: (reason) => openInstallmentDispute(contractId, reason),
    onSuccess: invalidateInstallment,
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
}
