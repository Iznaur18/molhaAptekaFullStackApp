import { useMemo, useState } from "react";

import type { InstallmentContract } from "@/entities/installment/api/installmentApi";
import { canBuyerMarkInstallmentPayment } from "@/entities/installment/lib/canBuyerMarkInstallmentPayment";
import { getInstallmentRemainingAmountRub } from "@/entities/installment/lib/getInstallmentRemainingAmountRub";
import { getInstallmentRemainingDays } from "@/entities/installment/lib/getInstallmentRemainingDays";
import { isEarlyPayoffPendingConfirmation } from "@/entities/installment/lib/isEarlyPayoffPendingConfirmation";
import {
  INSTALLMENT_CONTRACT_STATUS_ACTIVE,
  INSTALLMENT_CONTRACT_STATUS_COMPLETED,
  INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
  INSTALLMENT_PAYMENT_STATUS_DUE,
  INSTALLMENT_PAYMENT_STATUS_OVERDUE,
  INSTALLMENT_PAYMENT_STATUS_PAID,
  INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
} from "@/entities/installment/model/constants";
import { useInstallmentContractMutations } from "@/entities/installment/model/useInstallmentContractMutations";
import { INSTALLMENT_UI } from "@/shared/config";

type UseInstallmentContractCardParams = {
  contract: InstallmentContract;
  role: "buyer" | "seller";
  onUpdated?: () => void;
};

export const useInstallmentContractCard = ({
  contract,
  role,
  onUpdated,
}: UseInstallmentContractCardParams) => {
  const contractId = String(contract._id);
  const {
    markPaidMutation,
    confirmPaymentMutation,
    rejectPaymentMutation,
    markEarlyPayoffMutation,
    confirmEarlyPayoffMutation,
    cancelEarlyPayoffMutation,
    rejectEarlyPayoffMutation,
    openDisputeMutation,
  } = useInstallmentContractMutations(contractId);

  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const remainingRub = getInstallmentRemainingAmountRub(contract);
  const remainingDays = getInstallmentRemainingDays(contract);
  const statusLabel =
    INSTALLMENT_UI.CONTRACT_STATUS_LABEL[contract.status ?? ""] ?? contract.status ?? "—";
  const paidPercent =
    (contract.totalAmountRub ?? 0) > 0
      ? Math.min(
          100,
          Math.round(((contract.paidAmountRub ?? 0) / (contract.totalAmountRub ?? 1)) * 100),
        )
      : 0;

  const nextPayablePayment = useMemo(
    () =>
      (contract.payments ?? []).find(
        (payment) =>
          payment.status === INSTALLMENT_PAYMENT_STATUS_DUE ||
          payment.status === INSTALLMENT_PAYMENT_STATUS_OVERDUE,
      ),
    [contract.payments],
  );

  const earlyPayoffPending = useMemo(
    () => isEarlyPayoffPendingConfirmation(contract),
    [contract],
  );

  const isActiveContract =
    contract.status === INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT ||
    contract.status === INSTALLMENT_CONTRACT_STATUS_ACTIVE;

  const isFullyPaid = useMemo(() => {
    if (contract.status === INSTALLMENT_CONTRACT_STATUS_COMPLETED) {
      return true;
    }
    const payments = contract.payments ?? [];
    return (
      payments.length > 0 &&
      payments.every((payment) => payment.status === INSTALLMENT_PAYMENT_STATUS_PAID)
    );
  }, [contract.status, contract.payments]);

  const runAction = async (key: string, action: () => Promise<unknown>) => {
    setPendingKey(key);
    setError("");
    try {
      await action();
      onUpdated?.();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : INSTALLMENT_UI.ERROR_GENERIC);
    } finally {
      setPendingKey(null);
    }
  };

  return {
    remainingRub,
    remainingDays,
    statusLabel,
    paidPercent,
    nextPayablePayment,
    earlyPayoffPending,
    isActiveContract,
    isFullyPaid,
    pendingKey,
    error,
    showDisputeForm,
    setShowDisputeForm,
    disputeReason,
    setDisputeReason,
    handleMarkPaid: (paymentIndex: number) => {
      void runAction(`mark:${paymentIndex}`, () => markPaidMutation.mutateAsync(paymentIndex));
    },
    handleConfirmPayment: (paymentIndex: number) => {
      void runAction(`confirm:${paymentIndex}`, () =>
        confirmPaymentMutation.mutateAsync(paymentIndex),
      );
    },
    handleRejectPayment: (paymentIndex: number) => {
      void runAction(`reject:${paymentIndex}`, () =>
        rejectPaymentMutation.mutateAsync(paymentIndex),
      );
    },
    handleEarlyPayoff: () => {
      void runAction("early", () => markEarlyPayoffMutation.mutateAsync());
    },
    handleConfirmEarlyPayoff: () => {
      void runAction("early-confirm", () => confirmEarlyPayoffMutation.mutateAsync());
    },
    handleCancelEarlyPayoff: () => {
      void runAction("early-cancel", () => cancelEarlyPayoffMutation.mutateAsync());
    },
    handleRejectEarlyPayoff: () => {
      void runAction("early-reject", () => rejectEarlyPayoffMutation.mutateAsync());
    },
    handleOpenDispute: () => {
      const reason = disputeReason.trim();
      if (!reason) {
        return;
      }
      void runAction("dispute", async () => {
        await openDisputeMutation.mutateAsync(reason);
        setShowDisputeForm(false);
        setDisputeReason("");
      });
    },
    paymentStatusLabels: INSTALLMENT_UI.PAYMENT_STATUS_LABEL,
    canBuyerMarkPayment: canBuyerMarkInstallmentPayment,
    paymentStatuses: {
      due: INSTALLMENT_PAYMENT_STATUS_DUE,
      overdue: INSTALLMENT_PAYMENT_STATUS_OVERDUE,
      pendingConfirmation: INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
      paid: INSTALLMENT_PAYMENT_STATUS_PAID,
    },
    role,
  };
};
