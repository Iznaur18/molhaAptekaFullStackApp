import {
  INSTALLMENT_OP_CONFIRM_PAYMENT,
  INSTALLMENT_OP_MARK_PAYMENT_PAID,
  INSTALLMENT_OP_REJECT_PAYMENT,
  INSTALLMENT_PAYMENT_STATUS_DUE,
  INSTALLMENT_PAYMENT_STATUS_OVERDUE,
  INSTALLMENT_PAYMENT_STATUS_PAID,
  INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
  INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
} from "../../constants/installmentConstants.js";
import { AppError } from "../../errors/AppError.js";
import { InstallmentContractModel } from "../../models/index.js";
import {
  advanceInstallmentScheduleAfterPaymentMarkedPaid,
  buildInstallmentContractPayload,
  canBuyerMarkInstallmentPayment,
  restoreInstallmentScheduleAfterPendingMarksReverted,
} from "./installmentHelpers.js";
import { runInstallmentIdempotentMutation } from "./runInstallmentIdempotentMutation.js";

import {
  assertActiveInstallmentContract,
  assertInstallmentBuyer,
  assertInstallmentOrderAcceptedForPayments,
  assertInstallmentSellerOrAdmin,
  findContractPayment,
  loadInstallmentContractOrThrow,
} from "./installmentContractHelpers.js";

const MARK_PAID_ALLOWED_STATUSES = [
  INSTALLMENT_PAYMENT_STATUS_DUE,
  INSTALLMENT_PAYMENT_STATUS_OVERDUE,
  INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
];

/**
 * @param {{
 *   userId: string;
 *   contractId: string;
 *   paymentIndex: number | string;
 *   idempotencyKey?: string | null;
 * }} input
 */
export async function markInstallmentPaymentPaid({
  userId,
  contractId,
  paymentIndex,
  idempotencyKey = null,
}) {
  const contract = await loadInstallmentContractOrThrow(contractId);
  assertInstallmentBuyer(userId, contract);
  assertActiveInstallmentContract(contract);
  await assertInstallmentOrderAcceptedForPayments(contract);

  const idx = Number(paymentIndex);
  const payment = findContractPayment(contract, idx);
  if (!payment) {
    throw new AppError(404, "Платёж не найден");
  }

  if (payment.status === INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION) {
    // Уже отмечен — всё равно через idempotency (повтор ключа → duplicate).
  } else if (!canBuyerMarkInstallmentPayment(contract, payment)) {
    throw new AppError(409, "Платёж нельзя отметить сейчас");
  }

  const successMessage = "Ожидает подтверждения продавца";

  return runInstallmentIdempotentMutation({
    actorUserId: userId,
    contractId,
    action: INSTALLMENT_OP_MARK_PAYMENT_PAID,
    paymentIndex: idx,
    idempotencyKey,
    successMessage,
    execute: async () => {
      const markedAt = new Date();
      const claimed = await InstallmentContractModel.findOneAndUpdate(
        {
          _id: contractId,
          payments: {
            $elemMatch: {
              paymentIndex: idx,
              status: { $in: MARK_PAID_ALLOWED_STATUSES },
            },
          },
        },
        {
          $set: {
            "payments.$[p].status": INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
            "payments.$[p].buyerMarkedPaidAt": markedAt,
          },
        },
        {
          arrayFilters: [
            {
              "p.paymentIndex": idx,
              "p.status": { $in: MARK_PAID_ALLOWED_STATUSES },
            },
          ],
          returnDocument: "after",
        },
      );

      if (!claimed) {
        const fresh = await loadInstallmentContractOrThrow(contractId);
        const freshPayment = findContractPayment(fresh, idx);
        if (
          freshPayment?.status === INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION
        ) {
          return {
            message: successMessage,
            contract: await buildInstallmentContractPayload(fresh),
          };
        }
        throw new AppError(409, "Платёж нельзя отметить сейчас");
      }

      return {
        message: successMessage,
        contract: await buildInstallmentContractPayload(claimed),
      };
    },
  });
}

/**
 * @param {{
 *   userId: string;
 *   contractId: string;
 *   paymentIndex: number | string;
 *   idempotencyKey?: string | null;
 * }} input
 */
export async function rejectInstallmentPayment({
  userId,
  contractId,
  paymentIndex,
  idempotencyKey = null,
}) {
  const contract = await loadInstallmentContractOrThrow(contractId);
  await assertInstallmentSellerOrAdmin(userId, contract);
  assertActiveInstallmentContract(contract);
  await assertInstallmentOrderAcceptedForPayments(contract);

  const idx = Number(paymentIndex);
  const payment = findContractPayment(contract, idx);
  if (!payment) {
    throw new AppError(404, "Платёж не найден");
  }

  const successMessage = "Оплата отклонена";
  const now = new Date();
  const isPastDue = Boolean(payment.dueAt) && new Date(payment.dueAt) < now;
  const revertedStatus = isPastDue
    ? INSTALLMENT_PAYMENT_STATUS_OVERDUE
    : INSTALLMENT_PAYMENT_STATUS_SCHEDULED;

  return runInstallmentIdempotentMutation({
    actorUserId: userId,
    contractId,
    action: INSTALLMENT_OP_REJECT_PAYMENT,
    paymentIndex: idx,
    idempotencyKey,
    successMessage,
    execute: async () => {
      const claimed = await InstallmentContractModel.findOneAndUpdate(
        {
          _id: contractId,
          payments: {
            $elemMatch: {
              paymentIndex: idx,
              status: INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
            },
          },
        },
        {
          $set: {
            "payments.$[p].status": revertedStatus,
            "payments.$[p].buyerMarkedPaidAt": null,
            "payments.$[p].confirmedByUserId": null,
          },
        },
        {
          arrayFilters: [
            {
              "p.paymentIndex": idx,
              "p.status": INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
            },
          ],
          returnDocument: "after",
        },
      );

      if (!claimed) {
        throw new AppError(409, "Платёж не ожидает подтверждения");
      }

      restoreInstallmentScheduleAfterPendingMarksReverted(claimed);
      claimed.markModified("payments");
      await claimed.save();

      return {
        message: successMessage,
        contract: await buildInstallmentContractPayload(claimed),
      };
    },
  });
}

/**
 * @param {{
 *   userId: string;
 *   contractId: string;
 *   paymentIndex: number | string;
 *   idempotencyKey?: string | null;
 * }} input
 */
export async function confirmInstallmentPayment({
  userId,
  contractId,
  paymentIndex,
  idempotencyKey = null,
}) {
  const contract = await loadInstallmentContractOrThrow(contractId);
  await assertInstallmentSellerOrAdmin(userId, contract);
  await assertInstallmentOrderAcceptedForPayments(contract);

  const idx = Number(paymentIndex);
  const payment = findContractPayment(contract, idx);
  if (!payment) {
    throw new AppError(404, "Платёж не найден");
  }

  if (
    payment.status !== INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION &&
    payment.status !== INSTALLMENT_PAYMENT_STATUS_PAID
  ) {
    throw new AppError(409, "Платёж не ожидает подтверждения");
  }

  const amountRub = Number(payment.amountRub) || 0;
  const successMessage = "Платёж подтверждён";

  return runInstallmentIdempotentMutation({
    actorUserId: userId,
    contractId,
    action: INSTALLMENT_OP_CONFIRM_PAYMENT,
    paymentIndex: idx,
    idempotencyKey,
    successMessage,
    execute: async () => {
      const paidAt = new Date();
      const claimed = await InstallmentContractModel.findOneAndUpdate(
        {
          _id: contractId,
          payments: {
            $elemMatch: {
              paymentIndex: idx,
              status: INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
            },
          },
        },
        {
          $set: {
            "payments.$[p].status": INSTALLMENT_PAYMENT_STATUS_PAID,
            "payments.$[p].paidAt": paidAt,
            "payments.$[p].confirmedByUserId": userId,
          },
          $inc: { paidAmountRub: amountRub },
        },
        {
          arrayFilters: [
            {
              "p.paymentIndex": idx,
              "p.status": INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
            },
          ],
          returnDocument: "after",
        },
      );

      if (!claimed) {
        const fresh = await loadInstallmentContractOrThrow(contractId);
        const freshPayment = findContractPayment(fresh, idx);
        if (freshPayment?.status === INSTALLMENT_PAYMENT_STATUS_PAID) {
          return {
            message: successMessage,
            contract: await buildInstallmentContractPayload(fresh),
          };
        }
        throw new AppError(409, "Платёж не ожидает подтверждения");
      }

      advanceInstallmentScheduleAfterPaymentMarkedPaid(claimed, idx, paidAt);
      claimed.markModified("payments");
      await claimed.save();

      return {
        message: successMessage,
        contract: await buildInstallmentContractPayload(claimed),
      };
    },
  });
}
