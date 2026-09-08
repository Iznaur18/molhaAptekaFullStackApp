import {
  IN_APP_NOTIFICATION_KIND_MODERATION_TRUST_GRANTED,
  IN_APP_NOTIFICATION_KIND_MODERATION_TRUST_REVOKED,
  IN_APP_NOTIFICATION_MESSAGE_MODERATION_TRUST_GRANTED,
  IN_APP_NOTIFICATION_MESSAGE_MODERATION_TRUST_REVOKED,
} from "../../constants/productModerationConstants.js";
import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";

const notifySeller = async ({ sellerId, actorUserId, trusted }) => {
  try {
    await createUserInAppNotification({
      userId: sellerId,
      kind: trusted
        ? IN_APP_NOTIFICATION_KIND_MODERATION_TRUST_GRANTED
        : IN_APP_NOTIFICATION_KIND_MODERATION_TRUST_REVOKED,
      message: trusted
        ? IN_APP_NOTIFICATION_MESSAGE_MODERATION_TRUST_GRANTED
        : IN_APP_NOTIFICATION_MESSAGE_MODERATION_TRUST_REVOKED,
      actorUserId,
    });
  } catch (error) {
    // Право уже выдано и записано в аудит: провал уведомления не должен
    // разворачивать решение админа.
    logServerEvent("error", {
      event: "notify_product_moderation_trust",
      sellerId: String(sellerId),
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Включить или снять продавцу публикацию товаров без модерации.
 *
 * Уже опубликованные карточки не пересматриваются: снятие доверия закрывает
 * только следующие публикации, иначе один клик уносил бы из каталога сотни
 * позиций, к которым у модерации претензий не было.
 *
 * @param {{ sellerId: string; trusted: boolean; actorUserId: string }} input
 */
export async function setSellerProductModerationTrust({
  sellerId,
  trusted,
  actorUserId,
}) {
  const seller = await UserModel.findById(sellerId)
    .select("productModerationTrusted")
    .lean();
  if (!seller) {
    throw new AppError(404, "Пользователь не найден");
  }

  if (seller.productModerationTrusted === trusted) {
    return { userId: String(sellerId), productModerationTrusted: trusted };
  }

  await UserModel.updateOne(
    { _id: sellerId },
    { $set: { productModerationTrusted: trusted } },
  );

  await notifySeller({ sellerId, actorUserId, trusted });

  return { userId: String(sellerId), productModerationTrusted: trusted };
}
