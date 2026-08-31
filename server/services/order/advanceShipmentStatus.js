import { ORDER_FULFILLMENT_DELIVERY } from "@molha/api-contract";

import {
  ORDER_STATUS_ACCEPTED,
  ORDER_STATUS_ASSEMBLING,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_READY_FOR_PICKUP,
  ORDER_STATUS_READY_TO_SHIP,
  ORDER_TERMINAL_STATUSES,
} from "../../constants/orderConstants.js";
import { AppError } from "../../errors/AppError.js";

import { notifyBuyerAboutOrderItemStatus } from "./notifyBuyerAboutOrderItemStatus.js";
import {
  loadOrderWithItems,
  populateOrderForResponse,
} from "./orderItemStatusHelpers.js";
import { resolveItemSellerId, resolveShipmentFulfillment } from "./orderShipments.js";
import { buildOrderStatusFromItems } from "./orderStatus.js";

/**
 * Ступени сборки, по которым продавец двигает своё отправление.
 *
 * Ступени необязательные: продавец по-прежнему может отметить отправку сразу
 * из «В обработке». Здесь только переходы, добавляющие покупателю видимость
 * до момента отгрузки.
 */
const NEXT_STATUS_BY_CURRENT = Object.freeze({
  [ORDER_STATUS_PENDING]: () => ORDER_STATUS_ACCEPTED,
  [ORDER_STATUS_ACCEPTED]: () => ORDER_STATUS_ASSEMBLING,
  [ORDER_STATUS_ASSEMBLING]: (fulfillmentMethod) =>
    fulfillmentMethod === ORDER_FULFILLMENT_DELIVERY
      ? ORDER_STATUS_READY_TO_SHIP
      : ORDER_STATUS_READY_FOR_PICKUP,
});

const TERMINAL = new Set(ORDER_TERMINAL_STATUSES);

/**
 * Позиции отправления, которые ещё живы.
 *
 * Отменённые и возвращённые из отправления выпадают: продавец давно про них
 * решил, и тянуть их по лестнице дальше нечего.
 *
 * @param {{ items: Array<Record<string, any>> }} order
 * @param {string} sellerId
 */
const collectShipmentItems = (order, sellerId) => {
  const active = [];
  for (const item of order.items ?? []) {
    if (resolveItemSellerId(item) !== String(sellerId)) continue;
    if (TERMINAL.has(item.status)) continue;
    active.push(item);
  }
  return active;
};

/**
 * Следующая ступень для отправления, или `null` если двигать некуда.
 *
 * @param {string} currentStatus
 * @param {"pickup" | "delivery"} fulfillmentMethod
 */
export const resolveNextShipmentStatus = (currentStatus, fulfillmentMethod) => {
  const step = NEXT_STATUS_BY_CURRENT[currentStatus];
  return step ? step(fulfillmentMethod) : null;
};

/**
 * Двигает отправление продавца на одну ступень.
 *
 * Отправление ходит целиком: продавец принимает и собирает весь свой кусок
 * заказа, а не позицию за позицией. Отменить или вернуть отдельную позицию
 * по-прежнему можно — такие позиции просто выпадают из отправления.
 *
 * @param {{ orderId: string; sellerId: string; nextStatus: string }} input
 */
export async function advanceOrderShipmentStatus({ orderId, sellerId, nextStatus }) {
  const order = await loadOrderWithItems(orderId);
  const items = collectShipmentItems(order, sellerId);

  if (items.length === 0) {
    throw new AppError(404, "В заказе нет ваших позиций");
  }

  const fulfillmentMethod = resolveShipmentFulfillment(order, String(sellerId));
  const currentStatus = buildOrderStatusFromItems(items);
  const expected = resolveNextShipmentStatus(currentStatus, fulfillmentMethod);

  if (!expected) {
    throw new AppError(409, "Отправление уже прошло эту ступень");
  }
  if (expected !== nextStatus) {
    throw new AppError(
      409,
      `Из текущего состояния доступен только переход в «${expected}»`,
    );
  }

  for (const item of items) {
    item.status = nextStatus;
  }
  order.status = buildOrderStatusFromItems(order.items);
  await order.save();
  await populateOrderForResponse(order);

  // Одно уведомление на отправление, а не на каждую позицию: покупателю
  // важен факт «продавец взялся», а не построчный отчёт.
  await notifyBuyerAboutOrderItemStatus({
    buyerUserId: order.userBuyerId?._id ?? order.userBuyerId,
    actorUserId: sellerId,
    status: nextStatus,
    productName: items.length === 1 ? items[0].productNameAtOrder : "",
    orderId,
  });

  return { order, fulfillmentMethod, movedItemCount: items.length };
}
