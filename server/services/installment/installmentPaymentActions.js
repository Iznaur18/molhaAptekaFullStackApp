import { INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION } from "../../constants/installmentConstants.js";
import { AppError } from "../../errors/AppError.js";
import {
  applyConfirmedInstallmentPayment,
  buildInstallmentContractPayload,
  canBuyerMarkInstallmentPayment,
  rejectInstallmentPaymentPendingConfirmation,
} from "./installmentHelpers.js";

import {
  assertActiveInstallmentContract,
  assertInstallmentBuyer,
  assertInstallmentOrderAcceptedForPayments,
  assertInstallmentSellerOrAdmin,
  findContractPayment,
  loadInstallmentContractOrThrow,
} from "./installmentContractHelpers.js";

/**
 * @param {{
 *   userId: string;
 *   contractId: string;
 *   paymentIndex: number | string;
 * }} input
 */
export async function markInstallmentPaymentPaid({ userId, contractId, paymentIndex }) {
  const contract = await loadInstallmentContractOrThrow(contractId);
  assertInstallmentBuyer(userId, contract);
  assertActiveInstallmentContract(contract);
  await assertInstallmentOrderAcceptedForPayments(contract);

  const payment = findContractPayment(contract, paymentIndex);
  if (!payment) {
    throw new AppError(404, "Платёж не найден");
  }

  if (payment.status === INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION) {
    return {
      message: "Ожидает подтверждения продавца",
      contract: await buildInstallmentContractPayload(contract),
    };
  }

  if (!canBuyerMarkInstallmentPayment(contract, payment)) {
    throw new AppError(409, "Платёж нельзя отметить сейчас");
  }

  payment.status = INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION;
  payment.buyerMarkedPaidAt = new Date();
  contract.markModified("payments");
  await contract.save();

  return {
    message: "Ожидает подтверждения продавца",
    contract: await buildInstallmentContractPayload(contract),
  };
}

/**
 * @param {{
 *   userId: string;
 *   contractId: string;
 *   paymentIndex: number | string;
 * }} input
 */
export async function rejectInstallmentPayment({ userId, contractId, paymentIndex }) {
  const contract = await loadInstallmentContractOrThrow(contractId);
  await assertInstallmentSellerOrAdmin(userId, contract);
  assertActiveInstallmentContract(contract);
  await assertInstallmentOrderAcceptedForPayments(contract);

  try {
    rejectInstallmentPaymentPendingConfirmation(contract, paymentIndex);
  } catch (error) {
    throw new AppError(
      409,
      error instanceof Error ? error.message : "Платёж нельзя отклонить",
    );
  }

  contract.markModified("payments");
  await contract.save();

  return {
    message: "Оплата отклонена",
    contract: await buildInstallmentContractPayload(contract),
  };
}

/**
 * @param {{
 *   userId: string;
 *   contractId: string;
 *   paymentIndex: number | string;
 * }} input
 */
export async function confirmInstallmentPayment({ userId, contractId, paymentIndex }) {
  const contract = await loadInstallmentContractOrThrow(contractId);
  await assertInstallmentSellerOrAdmin(userId, contract);
  await assertInstallmentOrderAcceptedForPayments(contract);

  const payment = findContractPayment(contract, paymentIndex);
  if (!payment) {
    throw new AppError(404, "Платёж не найден");
  }
  if (payment.status !== INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION) {
    throw new AppError(409, "Платёж не ожидает подтверждения");
  }

  const paidAt = new Date();
  payment.confirmedByUserId = userId;
  applyConfirmedInstallmentPayment(contract, payment.paymentIndex, paidAt);
  await contract.save();

  return {
    message: "Платёж подтверждён",
    contract: await buildInstallmentContractPayload(contract),
  };
}
