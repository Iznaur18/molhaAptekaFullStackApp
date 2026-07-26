import { useMutation, useQueryClient } from "@tanstack/react-query";

import { catalogQueryKeys, installmentQueryKeys } from "@/shared/api";
import { createClientIdempotencyKey } from "@/shared/lib/createClientIdempotencyKey";

import {
  confirmInstallmentPayment,
  createInstallmentContract,
  markInstallmentPaymentPaid,
  rejectInstallmentPayment,
  upsertProductInstallmentProgram,
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
        passportShareConsent: true;
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
    }) =>
      markInstallmentPaymentPaid(
        contractId,
        paymentIndex,
        createClientIdempotencyKey(),
      ),
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
    }) =>
      confirmInstallmentPayment(
        contractId,
        paymentIndex,
        createClientIdempotencyKey(),
      ),
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
    }) =>
      rejectInstallmentPayment(
        contractId,
        paymentIndex,
        createClientIdempotencyKey(),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: installmentQueryKeys.all });
    },
  });

  const upsertProgramMutation = useMutation({
    mutationFn: ({
      productId,
      body,
    }: {
      productId: string;
      body: Parameters<typeof upsertProductInstallmentProgram>[1];
    }) => upsertProductInstallmentProgram(productId, body),
    onSuccess: (_data, { productId }) => {
      void queryClient.invalidateQueries({ queryKey: installmentQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: installmentQueryKeys.program(productId) });
      void queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
    },
  });

  return {
    createContractMutation,
    markPaidMutation,
    confirmPaymentMutation,
    rejectPaymentMutation,
    upsertProgramMutation,
  };
};
