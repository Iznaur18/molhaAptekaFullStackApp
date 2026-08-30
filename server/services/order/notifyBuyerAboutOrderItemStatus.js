import {
  BUYER_ORDER_STATUS_MESSAGES,
  IN_APP_NOTIFICATION_KIND_BUYER_ORDER_STATUS,
} from "../../constants/orderConstants.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";

/** Длинное название товара в пуше обрезается системой — режем осмысленно. */
const PRODUCT_NAME_MAX = 60;

/**
 * @param {{ status: string; productName?: string }} params
 * @returns {string}
 */
export function buildBuyerOrderStatusMessage({ status, productName }) {
  const base = BUYER_ORDER_STATUS_MESSAGES[status];
  if (!base) return "";

  const name = String(productName ?? "").trim();
  if (!name) return base;

  const short =
    name.length > PRODUCT_NAME_MAX
      ? `${name.slice(0, PRODUCT_NAME_MAX - 1).trimEnd()}…`
      : name;

  return `${base}: ${short}`;
}

/**
 * Сообщить покупателю, что его позицию отправили, доставили или отменили.
 *
 * Раньше сайт уведомлял только продавца о новом заказе, а покупатель узнавал
 * об изменениях, только если сам заходил в заказ. Поэтому продавцам приходилось
 * дублировать всё звонком.
 *
 * Уведомление — не часть транзакции заказа: упавший пуш не должен откатывать
 * смену статуса, поэтому ошибки только логируются.
 *
 * @param {{
 *   buyerUserId: unknown;
 *   actorUserId?: unknown;
 *   status: string;
 *   productName?: string;
 *   orderId?: unknown;
 * }} params
 */
export async function notifyBuyerAboutOrderItemStatus({
  buyerUserId,
  actorUserId = null,
  status,
  productName = "",
  orderId = null,
}) {
  const buyerId = buyerUserId ? String(buyerUserId) : "";
  if (!buyerId) return;

  // Покупатель сам отменил позицию — сообщать ему об этом незачем.
  if (actorUserId && String(actorUserId) === buyerId) return;

  const message = buildBuyerOrderStatusMessage({ status, productName });
  if (!message) return;

  try {
    await createUserInAppNotification({
      userId: buyerId,
      kind: IN_APP_NOTIFICATION_KIND_BUYER_ORDER_STATUS,
      message,
      // productId не передаём намеренно: с ним клик уводит на карточку товара,
      // а покупателю нужен его заказ.
      actorUserId: actorUserId ? String(actorUserId) : null,
    });
  } catch (error) {
    logServerEvent("error", {
      event: "notify_buyer_order_status_failed",
      orderId: orderId ? String(orderId) : "",
      status,
      ...formatLogError(error),
    });
  }
}
