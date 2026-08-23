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
  ProductModel,
  UserModel,
} from "../../models/index.js";
import { cancelLinkedOrderForInstallmentContract } from "../order/cancelLinkedOrderForInstallmentContract.js";
import {
  buildInstallmentContractPayload,
  loadInstallmentCounterpartyMap,
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

  const contractIds = rows.map((row) => row.contractId);
  const contracts = await InstallmentContractModel.find({ _id: { $in: contractIds } })
    .select("productId sellerUserId buyerUserId")
    .lean();
  const contractById = Object.fromEntries(
    contracts.map((contract) => [String(contract._id), contract]),
  );
  const productIds = [
    ...new Set(contracts.map((contract) => String(contract.productId))),
  ];
  const userIds = [
    ...new Set(
      contracts.flatMap((contract) => [
        String(contract.sellerUserId),
        String(contract.buyerUserId),
      ]),
    ),
  ];

  const [products, userMap] = await Promise.all([
    ProductModel.find({ _id: { $in: productIds } })
      .select("productName")
      .lean(),
    loadInstallmentCounterpartyMap(userIds),
  ]);
  const productById = Object.fromEntries(
    products.map((product) => [String(product._id), product]),
  );

  return rows.map((row) => {
    const contract = contractById[String(row.contractId)];
    const productName = contract
      ? (productById[String(contract.productId)]?.productName ?? null)
      : null;
    const seller = contract
      ? (userMap.get(String(contract.sellerUserId)) ?? null)
      : null;
    const buyer = contract ? (userMap.get(String(contract.buyerUserId)) ?? null) : null;

    return {
      _id: String(row._id),
      contractId: String(row.contractId),
      openedByUserId: String(row.openedByUserId),
      reason: row.reason,
      status: row.status,
      createdAt: row.createdAt,
      productName,
      seller,
      buyer,
    };
  });
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
    // Оба документа читаем внутри транзакции: на ретрае после WriteConflict
    // mongoose считает документы, загруженные снаружи, чистыми, и повторный
    // save() не пишет ничего — спор «закрывался» только в ответе API.
    const txnDispute =
      await InstallmentDisputeModel.findById(disputeId).session(session);
    if (!txnDispute) {
      throw new AppError(404, "Спор не найден");
    }
    if (txnDispute.status !== INSTALLMENT_DISPUTE_STATUS_OPEN) {
      throw new AppError(409, "Спор уже закрыт");
    }

    const txnContract = await InstallmentContractModel.findById(
      txnDispute.contractId,
    ).session(session);
    if (!txnContract) {
      throw new AppError(404, "Контракт не найден");
    }

    if (action === "cancel") {
      txnContract.status = INSTALLMENT_CONTRACT_STATUS_CANCELLED;
      txnContract.cancelledAt = new Date();
      txnContract.cancelledByUserId = userId;
      txnContract.cancellationReason = resolutionNote ?? "";
      await txnContract.save({ session });
      await cancelLinkedOrderForInstallmentContract(txnContract.orderId, session);
    } else if (action === "close") {
      txnContract.status = INSTALLMENT_CONTRACT_STATUS_COMPLETED;
      txnContract.completedAt = new Date();
      txnContract.nextPaymentDueAt = null;
      txnContract.hasOverduePayment = false;
      await txnContract.save({ session });
    } else if (action === "partial_refund") {
      const amount = Math.floor(Number(partialRefundRub));
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new AppError(400, "Укажите сумму частичного возврата");
      }

      txnContract.totalAmountRub = Math.max(
        txnContract.paidAmountRub,
        (Number(txnContract.totalAmountRub) || 0) - amount,
      );
      resolveContractStatusAfterPayment(txnContract);
      await txnContract.save({ session });
    } else if (action === "adjust_schedule") {
      const nextDue = txnContract.payments.find(
        (payment) => payment.status !== INSTALLMENT_PAYMENT_STATUS_PAID,
      );
      if (nextDue) {
        nextDue.dueAt = new Date(nextDue.dueAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      }
      recomputeContractOverdueFlags(txnContract);
      await txnContract.save({ session });
    }

    txnDispute.status = INSTALLMENT_DISPUTE_STATUS_RESOLVED;
    txnDispute.resolutionNote = String(resolutionNote ?? "").trim();
    txnDispute.resolvedByUserId = userId;
    txnDispute.resolvedAt = new Date();
    await txnDispute.save({ session });
  });

  // Ответ строим из перечитанных документов: те, что загружены до транзакции,
  // мутаций не получили.
  const resolvedDispute =
    (await InstallmentDisputeModel.findById(disputeId).lean()) ?? dispute;
  const resolvedContract =
    (await InstallmentContractModel.findById(dispute.contractId)) ?? contract;

  return {
    message: "Спор рассмотрен",
    dispute: {
      _id: String(resolvedDispute._id),
      status: resolvedDispute.status,
      resolutionNote: resolvedDispute.resolutionNote,
    },
    contract: await buildInstallmentContractPayload(resolvedContract),
  };
}
