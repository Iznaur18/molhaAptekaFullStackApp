import {
  IN_APP_NOTIFICATION_KIND_SELLER_ORDER_RETURNED,
  IN_APP_NOTIFICATION_MESSAGE_SELLER_ORDER_RETURNED,
} from "../../constants/orderConstants.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";

/** Длинное название в пуше обрезает система — режем осмысленно. */
const PRODUCT_NAME_MAX = 60;

/**
 * @param {string} productName
 * @returns {string}
 */
export function buildSellerOrderReturnMessage(productName) {
  const name = String(productName ?? "").trim();
  if (!name) return IN_APP_NOTIFICATION_MESSAGE_SELLER_ORDER_RETURNED;

  const short =
    name.length > PRODUCT_NAME_MAX
      ? `${name.slice(0, PRODUCT_NAME_MAX - 1).trimEnd()}…`
      : name;

  return `${IN_APP_NOTIFICATION_MESSAGE_SELLER_ORDER_RETURNED}: ${short}`;
}

/**
 * Сообщить продавцу, что покупатель отказался от позиции.
 *
 * Без этого отказ покупателя оставался незамеченным: уведомления о статусе
 * адресованы покупателю и при его собственном действии подавляются — то есть
 * продавец не узнавал, что товар едет обратно.
 *
 * Шлём только когда инициатор — покупатель: свой же возврат продавцу
 * пересказывать незачем.
 *
 * @param {{
 *   sellerUserId: unknown;
 *   actorUserId: unknown;
 *   buyerUserId: unknown;
 *   productName?: string;
 *   orderId?: unknown;
 * }} params
 */
export async function notifySellerAboutOrderItemReturn({
  sellerUserId,
  actorUserId,
  buyerUserId,
  productName = "",
  orderId = null,
}) {
  const sellerId = sellerUserId ? String(sellerUserId) : "";
  const actorId = actorUserId ? String(actorUserId) : "";
  const buyerId = buyerUserId ? String(buyerUserId) : "";

  if (!sellerId || !actorId || actorId !== buyerId) return;

  try {
    await createUserInAppNotification({
      userId: sellerId,
      kind: IN_APP_NOTIFICATION_KIND_SELLER_ORDER_RETURNED,
      message: buildSellerOrderReturnMessage(productName),
      actorUserId: buyerId || null,
    });
  } catch (error) {
    logServerEvent("error", {
      event: "notify_seller_order_return_failed",
      orderId: orderId ? String(orderId) : "",
      ...formatLogError(error),
    });
  }
}
