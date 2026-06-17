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
    contract.status = INSTALLMENT_CONTRACT_STATUS_CANCELLED;
    contract.cancelledAt = new Date();
    contract.cancelledByUserId = userId;
    contract.cancellationReason = String(reason ?? "").trim();
    await contract.save({ session });
    await cancelLinkedOrderForInstallmentContract(contract.orderId, session);
  });

  return {
    message: "Контракт отменён",
    contract: await buildInstallmentContractPayload(contract),
  };
}
