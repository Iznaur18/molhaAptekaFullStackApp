import { ORDER_FULFILLMENT_DELIVERY } from "@molha/api-contract";

import {
  COURIER_REPLACED_MESSAGE,
  COURIER_REPLACE_NO_COURIER_MESSAGE,
  COURIER_REPLACE_TOO_LATE_MESSAGE,
  IN_APP_NOTIFICATION_KIND_COURIER_REPLACED,
} from "../../constants/courierConstants.js";
import {
  ORDER_STATUS_COURIER_ASSIGNED,
  ORDER_STATUS_READY_TO_SHIP,
  ORDER_TERMINAL_STATUSES,
} from "../../constants/orderConstants.js";
import { AppError } from "../../errors/AppError.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";
import {
  loadOrderWithItems,
  normalizeId,
  populateOrderForResponse,
} from "../order/orderItemStatusHelpers.js";
import { resolveItemSellerId } from "../order/orderShipments.js";
import { buildOrderStatusFromItems } from "../order/orderStatus.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";

const TERMINAL = new Set(ORDER_TERMINAL_STATUSES);

/**
 * Продавец или покупатель отказывается от назначенного курьера.
 *
 * Только до передачи товара. После `courier_holding` товар уже в машине —
 * это возврат, а не смена курьера, и разбирается он иначе.
 *
 * Отказанный курьер попадает в чёрный список отправления: иначе он тут же
 * возьмёт его снова из «Обзора», и отказ ничего не изменит.
 *
 * @param {{ orderId: string; sellerId: string; requestUserId: string }} input
 */
export async function replaceShipmentCourier({ orderId, sellerId, requestUserId }) {
  const order = await loadOrderWithItems(orderId);

  const items = (order.items ?? []).filter(
    (item) =>
      resolveItemSellerId(item) === String(sellerId) && !TERMINAL.has(item.status),
  );
  if (items.length === 0) {
    throw new AppError(404, "Отправление не найдено");
  }

  const shipment = (order.shipments ?? []).find(
    (row) => row?.sellerId != null && String(row.sellerId) === String(sellerId),
  );
  if (!shipment || shipment.fulfillmentMethod !== ORDER_FULFILLMENT_DELIVERY) {
    throw new AppError(404, "Отправление не найдено");
  }

  const buyerId = normalizeId(order.userBuyerId?._id ?? order.userBuyerId);
  const isBuyer = buyerId === String(requestUserId);
  const isSeller = String(sellerId) === String(requestUserId);
  if (!isBuyer && !isSeller) {
    throw new AppError(403, "Сменить курьера могут продавец и покупатель");
  }

  const previousCourierId = shipment.courierId ? String(shipment.courierId) : "";
  if (!previousCourierId) {
    throw new AppError(409, COURIER_REPLACE_NO_COURIER_MESSAGE);
  }
  if (buildOrderStatusFromItems(items) !== ORDER_STATUS_COURIER_ASSIGNED) {
    throw new AppError(409, COURIER_REPLACE_TOO_LATE_MESSAGE);
  }

  const declined = (shipment.declinedCourierIds ?? []).map(String);
  if (!declined.includes(previousCourierId)) {
    shipment.declinedCourierIds = [...(shipment.declinedCourierIds ?? []), previousCourierId];
  }
  shipment.courierId = null;
  shipment.courierAssignedAt = null;
  // Выданный код больше не действует: заказ ждёт другого курьера.
  shipment.handoverCode = "";
  shipment.handoverCodeIssuedAt = null;
  shipment.handoverAttempts = 0;

  for (const item of items) {
    item.status = ORDER_STATUS_READY_TO_SHIP;
  }
  order.status = buildOrderStatusFromItems(order.items);
  await order.save();
  await populateOrderForResponse(order);

  try {
    await createUserInAppNotification({
      userId: previousCourierId,
      kind: IN_APP_NOTIFICATION_KIND_COURIER_REPLACED,
      message: COURIER_REPLACED_MESSAGE,
      actorUserId: String(requestUserId),
    });
  } catch (error) {
    // Курьер должен узнать, но упавшее уведомление не отменяет смену.
    logServerEvent("error", {
      event: "notify_courier_replaced_failed",
      orderId: String(orderId),
      ...formatLogError(error),
    });
  }

  return { order, previousCourierId };
}
