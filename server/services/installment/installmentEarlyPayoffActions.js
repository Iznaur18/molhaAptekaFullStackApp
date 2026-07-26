import {
  INSTALLMENT_CONTRACT_STATUS_ACTIVE,
  INSTALLMENT_CONTRACT_STATUS_COMPLETED,
  INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
  INSTALLMENT_OP_CANCEL_EARLY_PAYOFF,
  INSTALLMENT_OP_CONFIRM_EARLY_PAYOFF,
  INSTALLMENT_OP_MARK_EARLY_PAYOFF,
  INSTALLMENT_OP_REJECT_EARLY_PAYOFF,
  INSTALLMENT_PAYMENT_STATUS_DUE,
  INSTALLMENT_PAYMENT_STATUS_OVERDUE,
  INSTALLMENT_PAYMENT_STATUS_PAID,
  INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
  INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
} from "../../constants/installmentConstants.js";
import { AppError } from "../../errors/AppError.js";
import { InstallmentContractModel } from "../../models/index.js";
import {
  buildInstallmentContractPayload,
  isEarlyPayoffPendingConfirmation,
  notifySellerEarlyPayoff,
  restoreInstallmentScheduleAfterPendingMarksReverted,
} from "./installmentHelpers.js";
import { runInstallmentIdempotentMutation } from "./runInstallmentIdempotentMutation.js";

import {
  assertActiveInstallmentContract,
  assertInstallmentBuyer,
  assertInstallmentOrderAcceptedForPayments,
  assertInstallmentSellerOrAdmin,
  loadInstallmentContractOrThrow,
} from "./installmentContractHelpers.js";

const ACTIVE_FOR_EARLY_PAYOFF = [
  INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
  INSTALLMENT_CONTRACT_STATUS_ACTIVE,
];

/**
 * @param {{
 *   userId: string;
 *   contractId: string;
 *   idempotencyKey?: string | null;
 * }} input
 */
export async function rejectInstallmentEarlyPayoff({
  userId,
  contractId,
  idempotencyKey = null,
}) {
  const contract = await loadInstallmentContractOrThrow(contractId);
  await assertInstallmentSellerOrAdmin(userId, contract);
  assertActiveInstallmentContract(contract);
  await assertInstallmentOrderAcceptedForPayments(contract);

  const successMessage = "Досрочное погашение отклонено";

  return runInstallmentIdempotentMutation({
    actorUserId: userId,
    contractId,
    action: INSTALLMENT_OP_REJECT_EARLY_PAYOFF,
    idempotencyKey,
    successMessage,
    execute: async () => {
      const claimed = await InstallmentContractModel.findOneAndUpdate(
        {
          _id: contractId,
          status: { $in: ACTIVE_FOR_EARLY_PAYOFF },
          payments: {
            $elemMatch: {
              status: INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
            },
          },
        },
        {
          $set: {
            "payments.$[p].status": INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
            "payments.$[p].buyerMarkedPaidAt": null,
            "payments.$[p].confirmedByUserId": null,
          },
        },
        {
          arrayFilters: [
            { "p.status": INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION },
          ],
          returnDocument: "after",
        },
      );

      if (!claimed) {
        throw new AppError(409, "Нет досрочного погашения для отклонения");
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
 *   idempotencyKey?: string | null;
 * }} input
 */
export async function markInstallmentEarlyPayoff({
  userId,
  contractId,
  idempotencyKey = null,
}) {
  const contract = await loadInstallmentContractOrThrow(contractId);
  assertInstallmentBuyer(userId, contract);
  assertActiveInstallmentContract(contract);
  await assertInstallmentOrderAcceptedForPayments(contract);

  const remaining = (contract.payments ?? []).filter(
    (payment) => payment.status !== INSTALLMENT_PAYMENT_STATUS_PAID,
  );
  if (isEarlyPayoffPendingConfirmation(contract)) {
    // Уже отмечено — идём в idempotency (повтор ключа → duplicate).
  } else if (remaining.length === 0) {
    throw new AppError(409, "Долг уже погашен");
  }

  const successMessage = "Досрочное погашение ожидает подтверждения";
  const markableStatuses = [
    INSTALLMENT_PAYMENT_STATUS_DUE,
    INSTALLMENT_PAYMENT_STATUS_OVERDUE,
    INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
  ];

  return runInstallmentIdempotentMutation({
    actorUserId: userId,
    contractId,
    action: INSTALLMENT_OP_MARK_EARLY_PAYOFF,
    idempotencyKey,
    successMessage,
    execute: async () => {
      const markedAt = new Date();
      const claimed = await InstallmentContractModel.findOneAndUpdate(
        {
          _id: contractId,
          status: { $in: ACTIVE_FOR_EARLY_PAYOFF },
          payments: {
            $elemMatch: {
              status: { $in: markableStatuses },
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
              "p.status": { $in: markableStatuses },
            },
          ],
          returnDocument: "after",
        },
      );

      if (!claimed) {
        const fresh = await loadInstallmentContractOrThrow(contractId);
        if (isEarlyPayoffPendingConfirmation(fresh)) {
          const unpaid = (fresh.payments ?? []).filter(
            (payment) => payment.status !== INSTALLMENT_PAYMENT_STATUS_PAID,
          );
          return {
            message: successMessage,
            contract: await buildInstallmentContractPayload(fresh),
            remainingAmountRub: unpaid.reduce(
              (sum, payment) => sum + (Number(payment.amountRub) || 0),
              0,
            ),
          };
        }
        throw new AppError(409, "Долг уже погашен");
      }

      const unpaid = (claimed.payments ?? []).filter(
        (payment) => payment.status !== INSTALLMENT_PAYMENT_STATUS_PAID,
      );

      return {
        message: successMessage,
        contract: await buildInstallmentContractPayload(claimed),
        remainingAmountRub: unpaid.reduce(
          (sum, payment) => sum + (Number(payment.amountRub) || 0),
          0,
        ),
      };
    },
  });
}

/**
 * @param {{
 *   userId: string;
 *   contractId: string;
 *   idempotencyKey?: string | null;
 * }} input
 */
export async function cancelInstallmentEarlyPayoff({
  userId,
  contractId,
  idempotencyKey = null,
}) {
  const contract = await loadInstallmentContractOrThrow(contractId);
  assertInstallmentBuyer(userId, contract);
  assertActiveInstallmentContract(contract);
  await assertInstallmentOrderAcceptedForPayments(contract);

  const successMessage = "Досрочное погашение отменено";

  return runInstallmentIdempotentMutation({
    actorUserId: userId,
    contractId,
    action: INSTALLMENT_OP_CANCEL_EARLY_PAYOFF,
    idempotencyKey,
    successMessage,
    execute: async () => {
      const claimed = await InstallmentContractModel.findOneAndUpdate(
        {
          _id: contractId,
          status: { $in: ACTIVE_FOR_EARLY_PAYOFF },
          payments: {
            $elemMatch: {
              status: INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
            },
          },
        },
        {
          $set: {
            "payments.$[p].status": INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
            "payments.$[p].buyerMarkedPaidAt": null,
            "payments.$[p].confirmedByUserId": null,
          },
        },
        {
          arrayFilters: [
            { "p.status": INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION },
          ],
          returnDocument: "after",
        },
      );

      if (!claimed) {
        throw new AppError(409, "Нет досрочного погашения для отмены");
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
 *   idempotencyKey?: string | null;
 * }} input
 */
export async function confirmInstallmentEarlyPayoff({
  userId,
  contractId,
  idempotencyKey = null,
}) {
  const contract = await loadInstallmentContractOrThrow(contractId);
  await assertInstallmentSellerOrAdmin(userId, contract);
  await assertInstallmentOrderAcceptedForPayments(contract);

  const pending = (contract.payments ?? []).filter(
    (payment) => payment.status === INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
  );
  if (
    pending.length === 0 &&
    contract.status !== INSTALLMENT_CONTRACT_STATUS_COMPLETED
  ) {
    throw new AppError(409, "Нет ожидающих платежей");
  }

  const successMessage = "Досрочное погашение подтверждено";

  return runInstallmentIdempotentMutation({
    actorUserId: userId,
    contractId,
    action: INSTALLMENT_OP_CONFIRM_EARLY_PAYOFF,
    idempotencyKey,
    successMessage,
    execute: async () => {
      const paidAt = new Date();
      const claimed = await InstallmentContractModel.findOneAndUpdate(
        {
          _id: contractId,
          status: { $in: ACTIVE_FOR_EARLY_PAYOFF },
          payments: {
            $elemMatch: {
              status: INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
            },
          },
        },
        {
          $set: {
            "payments.$[p].status": INSTALLMENT_PAYMENT_STATUS_PAID,
            "payments.$[p].paidAt": paidAt,
            "payments.$[p].confirmedByUserId": userId,
            status: INSTALLMENT_CONTRACT_STATUS_COMPLETED,
            completedAt: paidAt,
            nextPaymentDueAt: null,
            hasOverduePayment: false,
          },
        },
        {
          arrayFilters: [
            { "p.status": INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION },
          ],
          returnDocument: "after",
        },
      );

      if (!claimed) {
        const fresh = await loadInstallmentContractOrThrow(contractId);
        if (fresh.status === INSTALLMENT_CONTRACT_STATUS_COMPLETED) {
          return {
            message: successMessage,
            contract: await buildInstallmentContractPayload(fresh),
          };
        }
        throw new AppError(409, "Нет ожидающих платежей");
      }

      claimed.paidAmountRub = (claimed.payments ?? [])
        .filter((payment) => payment.status === INSTALLMENT_PAYMENT_STATUS_PAID)
        .reduce((sum, payment) => sum + (Number(payment.amountRub) || 0), 0);
      await claimed.save();

      await notifySellerEarlyPayoff(
        String(claimed.sellerUserId),
        String(claimed.productId),
      );

      return {
        message: successMessage,
        contract: await buildInstallmentContractPayload(claimed),
      };
    },
  });
}
