import { IN_APP_NOTIFICATION_KIND_INSTALLMENT_SELLER_MESSAGE } from "../../constants/installmentConstants.js";
import { AppError } from "../../errors/AppError.js";
import { InstallmentContractModel } from "../../models/index.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";

/**
 * @param {{
 *   userId: string;
 *   contractId: string;
 *   message: string;
 * }} input
 */
export async function sendInstallmentSellerMessage({ userId, contractId, message }) {
  const contract = await InstallmentContractModel.findById(contractId).lean();
  if (!contract) {
    throw new AppError(404, "Контракт не найден");
  }
  if (String(contract.sellerUserId) !== String(userId)) {
    throw new AppError(403, "Нет прав");
  }

  await createUserInAppNotification({
    userId: contract.buyerUserId,
    kind: IN_APP_NOTIFICATION_KIND_INSTALLMENT_SELLER_MESSAGE,
    message: String(message ?? "").trim(),
    productId: contract.productId,
    actorUserId: userId,
  });

  return { message: "Сообщение отправлено" };
}
