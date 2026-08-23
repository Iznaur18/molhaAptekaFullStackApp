import {
  INSTALLMENT_CONTRACT_STATUS_CANCELLED,
  INSTALLMENT_CONTRACT_STATUS_COMPLETED,
} from "../../constants/installmentConstants.js";
import { AppError } from "../../errors/AppError.js";
import { InstallmentContractModel } from "../../models/index.js";
import { cancelLinkedOrderForInstallmentContract } from "../order/cancelLinkedOrderForInstallmentContract.js";
import { buildInstallmentContractPayload } from "./installmentHelpers.js";
import { isUserAdmin } from "../access/adminUserGuard.js";
import { runInTransaction } from "../../utils/mongoTransaction.js";

/**
 * @param {{
 *   userId: string;
 *   contractId: string;
 *   reason?: string;
 * }} input
 */
export async function cancelInstallmentContract({ userId, contractId, reason = "" }) {
  const contract = await InstallmentContractModel.findById(contractId);
  if (!contract) {
    throw new AppError(404, "Контракт не найден");
  }

  const isBuyer = String(contract.buyerUserId) === String(userId);
  const isSeller = String(contract.sellerUserId) === String(userId);
  const isAdmin = await isUserAdmin(userId);

  if (!isBuyer && !isSeller && !isAdmin) {
    throw new AppError(403, "Нет прав");
  }

  if (contract.status === INSTALLMENT_CONTRACT_STATUS_COMPLETED) {
    throw new AppError(409, "Контракт уже закрыт");
  }
  if (contract.status === INSTALLMENT_CONTRACT_STATUS_CANCELLED) {
    throw new AppError(409, "Контракт уже отменён");
  }

  await runInTransaction(async (session) => {
    // Документ читаем внутри транзакции: withTransaction повторяет колбэк при
    // WriteConflict, а mongoose после первого (откатившегося) save() считает
    // документ чистым — повторный проход по документу, загруженному снаружи,
    // молча не записывал ничего.
    const txnContract =
      await InstallmentContractModel.findById(contractId).session(session);
    if (!txnContract) {
      throw new AppError(404, "Контракт не найден");
    }
    if (txnContract.status === INSTALLMENT_CONTRACT_STATUS_CANCELLED) {
      return;
    }
    if (txnContract.status === INSTALLMENT_CONTRACT_STATUS_COMPLETED) {
      throw new AppError(409, "Контракт уже закрыт");
    }

    txnContract.status = INSTALLMENT_CONTRACT_STATUS_CANCELLED;
    txnContract.cancelledAt = new Date();
    txnContract.cancelledByUserId = userId;
    txnContract.cancellationReason = String(reason ?? "").trim();
    await txnContract.save({ session });
    await cancelLinkedOrderForInstallmentContract(txnContract.orderId, session);
  });

  const cancelled = await InstallmentContractModel.findById(contractId);

  return {
    message: "Контракт отменён",
    contract: await buildInstallmentContractPayload(cancelled ?? contract),
  };
}
