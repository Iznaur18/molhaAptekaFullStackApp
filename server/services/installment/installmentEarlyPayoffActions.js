import {
  INSTALLMENT_CONTRACT_STATUS_COMPLETED,
  INSTALLMENT_PAYMENT_STATUS_PAID,
  INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
} from "../../constants/installmentConstants.js";
import { AppError } from "../../errors/AppError.js";
import {
  buildInstallmentContractPayload,
  isEarlyPayoffPendingConfirmation,
  notifySellerEarlyPayoff,
  revertInstallmentPaymentsAfterEarlyPayoffCancel,
} from "./installmentHelpers.js";

import {
  assertActiveInstallmentContract,
  assertInstallmentBuyer,
  assertInstallmentOrderAcceptedForPayments,
  assertInstallmentSellerOrAdmin,
  loadInstallmentContractOrThrow,
} from "./installmentContractHelpers.js";

/**
 * @param {{ userId: string; contractId: string }} input
 */
export async function rejectInstallmentEarlyPayoff({ userId, contractId }) {
  const contract = await loadInstallmentContractOrThrow(contractId);
  await assertInstallmentSellerOrAdmin(userId, contract);
  assertActiveInstallmentContract(contract);
  await assertInstallmentOrderAcceptedForPayments(contract);

  if (!isEarlyPayoffPendingConfirmation(contract)) {
    throw new AppError(409, "Нет досрочного погашения для отклонения");
  }

  revertInstallmentPaymentsAfterEarlyPayoffCancel(contract);
  contract.markModified("payments");
  await contract.save();

  return {
    message: "Досрочное погашение отклонено",
    contract: await buildInstallmentContractPayload(contract),
  };
}

/**
 * @param {{ userId: string; contractId: string }} input
 */
export async function markInstallmentEarlyPayoff({ userId, contractId }) {
  const contract = await loadInstallmentContractOrThrow(contractId);
  assertInstallmentBuyer(userId, contract);
  assertActiveInstallmentContract(contract);
  await assertInstallmentOrderAcceptedForPayments(contract);

  const remaining = (contract.payments ?? []).filter(
    (payment) => payment.status !== INSTALLMENT_PAYMENT_STATUS_PAID,
  );
  if (remaining.length === 0) {
    throw new AppError(409, "Долг уже погашен");
  }

  for (const payment of remaining) {
    payment.status = INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION;
    payment.buyerMarkedPaidAt = new Date();
  }

  contract.markModified("payments");
  await contract.save();

  return {
    message: "Досрочное погашение ожидает подтверждения",
    contract: await buildInstallmentContractPayload(contract),
    remainingAmountRub: remaining.reduce((sum, payment) => sum + payment.amountRub, 0),
  };
}

/**
 * @param {{ userId: string; contractId: string }} input
 */
export async function cancelInstallmentEarlyPayoff({ userId, contractId }) {
  const contract = await loadInstallmentContractOrThrow(contractId);
  assertInstallmentBuyer(userId, contract);
  assertActiveInstallmentContract(contract);
  await assertInstallmentOrderAcceptedForPayments(contract);

  if (!isEarlyPayoffPendingConfirmation(contract)) {
    throw new AppError(409, "Нет досрочного погашения для отмены");
  }

  revertInstallmentPaymentsAfterEarlyPayoffCancel(contract);
  contract.markModified("payments");
  await contract.save();

  return {
    message: "Досрочное погашение отменено",
    contract: await buildInstallmentContractPayload(contract),
  };
}

/**
 * @param {{ userId: string; contractId: string }} input
 */
export async function confirmInstallmentEarlyPayoff({ userId, contractId }) {
  const contract = await loadInstallmentContractOrThrow(contractId);
  await assertInstallmentSellerOrAdmin(userId, contract);
  await assertInstallmentOrderAcceptedForPayments(contract);

  const pending = (contract.payments ?? []).filter(
    (payment) => payment.status === INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
  );
  if (pending.length === 0) {
    throw new AppError(409, "Нет ожидающих платежей");
  }

  const paidAt = new Date();
  for (const payment of pending) {
    payment.status = INSTALLMENT_PAYMENT_STATUS_PAID;
    payment.paidAt = paidAt;
    payment.confirmedByUserId = userId;
    contract.paidAmountRub =
      (Number(contract.paidAmountRub) || 0) + (Number(payment.amountRub) || 0);
  }

  contract.status = INSTALLMENT_CONTRACT_STATUS_COMPLETED;
  contract.completedAt = paidAt;
  contract.nextPaymentDueAt = null;
  contract.hasOverduePayment = false;
  await contract.save();

  await notifySellerEarlyPayoff(String(contract.sellerUserId), String(contract.productId));

  return {
    message: "Досрочное погашение подтверждено",
    contract: await buildInstallmentContractPayload(contract),
  };
}
