import { useMemo, useState } from "react";

import { useInstallmentContractMutations } from "./useInstallmentMutations.js";
import {
  INSTALLMENT_CONTRACT_STATUS_ACTIVE,
  INSTALLMENT_CONTRACT_STATUS_COMPLETED,
  INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
  INSTALLMENT_PAYMENT_STATUS_DUE,
  INSTALLMENT_PAYMENT_STATUS_OVERDUE,
  INSTALLMENT_PAYMENT_STATUS_PAID,
  INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
} from "./constants.js";
import { canBuyerMarkInstallmentPayment } from "../lib/canBuyerMarkInstallmentPayment.js";
import { isEarlyPayoffPendingConfirmation } from "../lib/isEarlyPayoffPendingConfirmation.js";
import {
  getInstallmentRemainingAmountRub,
  getInstallmentRemainingDays,
} from "../lib/resolveInstallmentUiState.js";
import { INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   contract: import('./types.js').InstallmentContractFromApi;
 *   role: "buyer" | "seller";
 *   onUpdated?: (contract: import('./types.js').InstallmentContractFromApi) => void;
 * }} params
 */
export function useInstallmentContractCard({ contract, role, onUpdated }) {
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

  const [pendingKey, setPendingKey] = useState(null);
  const [error, setError] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const remainingRub = getInstallmentRemainingAmountRub(contract);
  const remainingDays = getInstallmentRemainingDays(contract);
  const statusLabel =
    INSTALLMENT_UI.CONTRACT_STATUS_LABEL[contract.status] ?? contract.status;
  const paidPercent =
    contract.totalAmountRub > 0
      ? Math.min(100, Math.round((contract.paidAmountRub / contract.totalAmountRub) * 100))
      : 0;

  const nextPayablePayment = useMemo(
    () =>
      contract.payments.find(
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

  const runAction = async (key, action) => {
    setPendingKey(key);
    setError("");
    try {
      const result = await action();
      if (result?.contract) {
        onUpdated?.(result.contract);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : INSTALLMENT_UI.ERROR_GENERIC);
    } finally {
      setPendingKey(null);
    }
  };

  const handleMarkPaid = (paymentIndex) => {
    void runAction(`mark:${paymentIndex}`, () =>
      markPaidMutation.mutateAsync(paymentIndex),
    );
  };

  const handleConfirmPayment = (paymentIndex) => {
    void runAction(`confirm:${paymentIndex}`, () =>
      confirmPaymentMutation.mutateAsync(paymentIndex),
    );
  };

  const handleRejectPayment = (paymentIndex) => {
    void runAction(`reject:${paymentIndex}`, () =>
      rejectPaymentMutation.mutateAsync(paymentIndex),
    );
  };

  const handleEarlyPayoff = () => {
    void runAction("early", () => markEarlyPayoffMutation.mutateAsync());
  };

  const handleConfirmEarlyPayoff = () => {
    void runAction("early-confirm", () => confirmEarlyPayoffMutation.mutateAsync());
  };

  const handleCancelEarlyPayoff = () => {
    void runAction("early-cancel", () => cancelEarlyPayoffMutation.mutateAsync());
  };

  const handleRejectEarlyPayoff = () => {
    void runAction("early-reject", () => rejectEarlyPayoffMutation.mutateAsync());
  };

  const handleOpenDispute = () => {
    const reason = disputeReason.trim();
    if (!reason) return;
    void runAction("dispute", async () => {
      const result = await openDisputeMutation.mutateAsync(reason);
      setShowDisputeForm(false);
      setDisputeReason("");
      return result;
    });
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
    handleMarkPaid,
    handleConfirmPayment,
    handleRejectPayment,
    handleEarlyPayoff,
    handleConfirmEarlyPayoff,
    handleCancelEarlyPayoff,
    handleRejectEarlyPayoff,
    handleOpenDispute,
    paymentStatusLabels: INSTALLMENT_UI.PAYMENT_STATUS_LABEL,
    canBuyerMarkPayment: canBuyerMarkInstallmentPayment,
    paymentStatuses: {
      due: INSTALLMENT_PAYMENT_STATUS_DUE,
      overdue: INSTALLMENT_PAYMENT_STATUS_OVERDUE,
      pendingConfirmation: INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
      paid: INSTALLMENT_PAYMENT_STATUS_PAID,
    },
  };
}
