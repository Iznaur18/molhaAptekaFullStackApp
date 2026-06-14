import { useMutation, useQueryClient } from "@tanstack/react-query";

import { installmentQueryKeys } from "@/shared/api";

import {
  confirmInstallmentPayment,
  createInstallmentContract,
  markInstallmentPaymentPaid,
  rejectInstallmentPayment,
} from "../api/installmentApi";

export const useInstallmentMutations = () => {
  const queryClient = useQueryClient();

  const createContractMutation = useMutation({
    mutationFn: ({
      productId,
      body,
    }: {
      productId: string;
      body: {
        planId: string;
        quantity: number;
        deliveryAddress: string;
        deliveryAddressFlat?: string;
        paymentMethod: string;
      };
    }) => createInstallmentContract(productId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: installmentQueryKeys.all });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: ({
      contractId,
      paymentIndex,
    }: {
      contractId: string;
      paymentIndex: number;
    }) => markInstallmentPaymentPaid(contractId, paymentIndex),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: installmentQueryKeys.all });
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: ({
      contractId,
      paymentIndex,
    }: {
      contractId: string;
      paymentIndex: number;
    }) => confirmInstallmentPayment(contractId, paymentIndex),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: installmentQueryKeys.all });
    },
  });

  const rejectPaymentMutation = useMutation({
    mutationFn: ({
      contractId,
      paymentIndex,
    }: {
      contractId: string;
      paymentIndex: number;
    }) => rejectInstallmentPayment(contractId, paymentIndex),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: installmentQueryKeys.all });
    },
  });

  return {
    createContractMutation,
    markPaidMutation,
    confirmPaymentMutation,
    rejectPaymentMutation,
  };
};
