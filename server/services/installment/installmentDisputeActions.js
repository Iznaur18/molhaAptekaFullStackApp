import {
  INSTALLMENT_CONTRACT_STATUS_CANCELLED,
  INSTALLMENT_CONTRACT_STATUS_COMPLETED,
  INSTALLMENT_DISPUTE_STATUS_OPEN,
  INSTALLMENT_DISPUTE_STATUS_RESOLVED,
  INSTALLMENT_PAYMENT_STATUS_PAID,
  IN_APP_NOTIFICATION_KIND_INSTALLMENT_DISPUTE_OPENED,
} from "../../constants/installmentConstants.js";
import { AppError } from "../../errors/AppError.js";
import {
  InstallmentContractModel,
  InstallmentDisputeModel,
  UserModel,
} from "../../models/index.js";
import { cancelLinkedOrderForInstallmentContract } from "../order/cancelLinkedOrderForInstallmentContract.js";
import {
  buildInstallmentContractPayload,
  recomputeContractOverdueFlags,
  resolveContractStatusAfterPayment,
} from "./installmentHelpers.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";
import { runInTransaction } from "../../utils/mongoTransaction.js";

import { assertInstallmentParticipant } from "./installmentContractHelpers.js";

/**
 * @param {{
 *   userId: string;
 *   contractId: string;
 *   reason: string;
 * }} input
 */
export async function openInstallmentDispute({ userId, contractId, reason }) {
  const contract = await InstallmentContractModel.findById(contractId).lean();
  if (!contract) {
    throw new AppError(404, "Контракт не найден");
  }

  assertInstallmentParticipant(userId, contract);

  const existing = await InstallmentDisputeModel.findOne({
    contractId,
    status: INSTALLMENT_DISPUTE_STATUS_OPEN,
  });
  if (existing) {
    throw new AppError(409, "Спор уже открыт");
  }

  const dispute = await InstallmentDisputeModel.create({
    contractId,
    openedByUserId: userId,
    reason: String(reason ?? "").trim(),
  });

  const staffIds = await UserModel.find({
    userRole: { $in: ["admin", "moderator"] },
    isBlockedUser: { $ne: true },
  })
    .select("_id")
    .lean();

  await Promise.all(
    staffIds.map((staff) =>
      createUserInAppNotification({
        userId: staff._id,
        kind: IN_APP_NOTIFICATION_KIND_INSTALLMENT_DISPUTE_OPENED,
        message: String(reason ?? "").trim(),
        productId: contract.productId,
        actorUserId: userId,
      }),
    ),
  );

  return {
    message: "Спор открыт",
    dispute: {
      _id: String(dispute._id),
      contractId: String(dispute.contractId),
      status: dispute.status,
      reason: dispute.reason,
      createdAt: dispute.createdAt,
    },
  };
}

export async function listPendingInstallmentDisputes() {
  const rows = await InstallmentDisputeModel.find({
    status: INSTALLMENT_DISPUTE_STATUS_OPEN,
  })
    .sort({ createdAt: 1 })
    .lean();

  return rows.map((row) => ({
    _id: String(row._id),
    contractId: String(row.contractId),
    openedByUserId: String(row.openedByUserId),
    reason: row.reason,
    status: row.status,
    createdAt: row.createdAt,
  }));
}

export async function countPendingInstallmentDisputes() {
  return InstallmentDisputeModel.countDocuments({
    status: INSTALLMENT_DISPUTE_STATUS_OPEN,
  });
}

/**
 * @param {{
 *   userId: string;
 *   disputeId: string;
 *   action: string;
 *   resolutionNote?: string;
 *   partialRefundRub?: number;
 * }} input
 */
export async function resolveInstallmentDispute({
  userId,
  disputeId,
  action,
  resolutionNote,
  partialRefundRub,
}) {
  const dispute = await InstallmentDisputeModel.findById(disputeId);
  if (!dispute) {
    throw new AppError(404, "Спор не найден");
  }
  if (dispute.status !== INSTALLMENT_DISPUTE_STATUS_OPEN) {
    throw new AppError(409, "Спор уже закрыт");
  }

  const contract = await InstallmentContractModel.findById(dispute.contractId);
  if (!contract) {
    throw new AppError(404, "Контракт не найден");
  }

  await runInTransaction(async (session) => {
    if (action === "cancel") {
      contract.status = INSTALLMENT_CONTRACT_STATUS_CANCELLED;
      contract.cancelledAt = new Date();
      contract.cancelledByUserId = userId;
      contract.cancellationReason = resolutionNote ?? "";
      await contract.save({ session });
      await cancelLinkedOrderForInstallmentContract(contract.orderId, session);
    } else if (action === "close") {
      contract.status = INSTALLMENT_CONTRACT_STATUS_COMPLETED;
      contract.completedAt = new Date();
      contract.nextPaymentDueAt = null;
      contract.hasOverduePayment = false;
      await contract.save({ session });
    } else if (action === "partial_refund") {
      const amount = Math.floor(Number(partialRefundRub));
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new AppError(400, "Укажите сумму частичного возврата");
      }

      contract.totalAmountRub = Math.max(
        contract.paidAmountRub,
        (Number(contract.totalAmountRub) || 0) - amount,
      );
      resolveContractStatusAfterPayment(contract);
      await contract.save({ session });
    } else if (action === "adjust_schedule") {
      const nextDue = contract.payments.find(
        (payment) => payment.status !== INSTALLMENT_PAYMENT_STATUS_PAID,
      );
      if (nextDue) {
        nextDue.dueAt = new Date(nextDue.dueAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      }
      recomputeContractOverdueFlags(contract);
      await contract.save({ session });
    }

    dispute.status = INSTALLMENT_DISPUTE_STATUS_RESOLVED;
    dispute.resolutionNote = String(resolutionNote ?? "").trim();
    dispute.resolvedByUserId = userId;
    dispute.resolvedAt = new Date();
    await dispute.save({ session });
  });

  return {
    message: "Спор рассмотрен",
    dispute: {
      _id: String(dispute._id),
      status: dispute.status,
      resolutionNote: dispute.resolutionNote,
    },
    contract: await buildInstallmentContractPayload(contract),
  };
}
