import {
  BUYER_ORDER_CARRIER_NOT_DELIVERED_MESSAGE,
  IN_APP_NOTIFICATION_KIND_BUYER_ORDER_STATUS,
  IN_APP_NOTIFICATION_KIND_SELLER_ORDER_RETURNED,
  ORDER_PRE_SHIPMENT_STATUSES,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_SHIPPED,
  SELLER_ORDER_CARRIER_NOT_DELIVERED_MESSAGE,
} from "../../constants/orderConstants.js";
import { OrderModel } from "../../models/index.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";
import { resolveItemSellerId } from "../order/orderShipments.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";

/**
 * Ступени заказа по статусу внешней службы (СДЭК, Яндекс Доставка).
 *
 * «Отгружен» и «Доставлен» у таких отправлений ставит опрос службы, а не
 * кнопка продавца. Ступени ставим штатными сервисами — с их уведомлениями,
 * счётчиками продаж и эскроу, флагом viaCarrierSync.
 */

const PRE_SHIPMENT = new Set(ORDER_PRE_SHIPMENT_STATUSES);

/**
 * @param {{ orderId: string; sellerId: string }} params
 */
async function readSellerItems({ orderId, sellerId }) {
  const order = await OrderModel.findById(orderId).select("items").lean();
  // Номер позиции — место в массиве: в сыром документе itemIndex нет.
  return (order?.items ?? [])
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => resolveItemSellerId(item) === String(sellerId));
}

/**
 * @param {{
 *   orderId: string;
 *   sellerId: string;
 *   step: "shipped" | "delivered" | null;
 *   carrier: string;
 *   statusCode?: string | null;
 * }} input
 * @returns {Promise<number>} сколько позиций сдвинули
 */
export async function applyCarrierStepToOrder({
  orderId,
  sellerId,
  step,
  carrier,
  statusCode = null,
}) {
  if (!step) return 0;

  const { markOrderItemDeliveredBySeller, markOrderItemShippedBySeller } =
    await import("../order/updateOrderItemStatus.js");

  let moved = 0;
  // Опрос редкий: служба могла и принять, и вручить между двумя проходами —
  // тогда сначала догоняем «Отгружен», иначе «Доставлен» не поставить.
  for (const { item, index } of await readSellerItems({ orderId, sellerId })) {
    if (!PRE_SHIPMENT.has(item.status)) continue;
    await markOrderItemShippedBySeller({
      orderId,
      itemIndex: index,
      sellerId,
      viaCarrierSync: true,
    });
    moved += 1;
  }

  if (step === ORDER_STATUS_DELIVERED) {
    for (const { item, index } of await readSellerItems({ orderId, sellerId })) {
      if (item.status !== ORDER_STATUS_SHIPPED) continue;
      await markOrderItemDeliveredBySeller({
        orderId,
        itemIndex: index,
        sellerId,
        userId: sellerId,
        viaCarrierSync: true,
      });
      moved += 1;
    }
  }

  if (moved > 0) {
    logServerEvent("info", {
      event: "carrier.order_status_applied",
      carrier,
      orderId: String(orderId),
      statusCode: String(statusCode ?? ""),
      step,
      moved,
    });
  }
  return moved;
}

/**
 * Посылка вернулась к продавцу — «Вернулся» штатным сервисом: он вернёт
 * остаток и снимет выплату продавцу.
 *
 * @param {{ orderId: string; sellerId: string; carrier: string }} input
 * @returns {Promise<number>}
 */
export async function applyCarrierReturnToOrder({ orderId, sellerId, carrier }) {
  const { markOrderItemReturned } = await import("../order/updateOrderItemStatus.js");
  const returnable = new Set([ORDER_STATUS_SHIPPED, ORDER_STATUS_DELIVERED]);
  let moved = 0;
  for (const { item, index } of await readSellerItems({ orderId, sellerId })) {
    if (!returnable.has(item.status)) continue;
    await markOrderItemReturned({
      orderId,
      itemIndex: index,
      requestUserId: sellerId,
      viaCarrierSync: true,
    });
    moved += 1;
  }
  if (moved > 0) {
    logServerEvent("info", {
      event: "carrier.order_returned",
      carrier,
      orderId: String(orderId),
      moved,
    });
  }

  // Позиции, отменённые по «Не вручён», держали остаток, пока посылка ехала
  // назад. Теперь товар у продавца — отпускаем его в продажу.
  const released = await releaseCarrierReturnHold({ orderId, sellerId });
  if (released > 0) {
    logServerEvent("info", {
      event: "carrier.return_hold_released",
      carrier,
      orderId: String(orderId),
      released,
    });
  }
  return moved;
}

/**
 * @param {{ orderId: string; sellerId: string }} input
 * @returns {Promise<number>} сколько позиций отпустили
 */
async function releaseCarrierReturnHold({ orderId, sellerId }) {
  const held = (await readSellerItems({ orderId, sellerId })).filter(
    ({ item }) => item.awaitingCarrierReturn === true,
  );
  if (held.length === 0) return 0;

  const $set = Object.fromEntries(
    held.map(({ index }) => [`items.${index}.awaitingCarrierReturn`, false]),
  );
  await OrderModel.updateOne({ _id: orderId }, { $set });

  const { syncProductCatalogAfterStockChange } =
    await import("../product/productStock.js");
  const productIds = new Set(held.map(({ item }) => String(item.productId ?? "")));
  for (const productId of productIds) {
    if (productId) await syncProductCatalogAfterStockChange(productId);
  }
  return held.length;
}

/**
 * @param {{ userId: string; kind: string; message: string; orderId: string }} input
 */
async function notifyCarrierNotDelivered({ userId, kind, message, orderId }) {
  if (!userId) return;
  try {
    await createUserInAppNotification({ userId: String(userId), kind, message });
  } catch (error) {
    logServerEvent("warn", {
      event: "carrier.not_delivered_notify_failed",
      orderId: String(orderId),
      ...formatLogError(error),
    });
  }
}

/**
 * Служба сообщила «Не вручён» — покупатель посылку не забрал. Позиции
 * продавца закрываем сами, без кнопки, и сообщаем обеим сторонам.
 * Повторный опрос с тем же статусом ничего не меняет: закрывать уже нечего.
 *
 * @param {{ orderId: string; sellerId: string; carrier: string }} input
 * @returns {Promise<number>} сколько позиций отменили
 */
export async function applyCarrierNotDeliveredToOrder({ orderId, sellerId, carrier }) {
  const { cancelOrderItemsNotDeliveredByCarrier } =
    await import("../order/cancelOrderItems.js");
  const { cancelledCount, buyerId, prepaid } =
    await cancelOrderItemsNotDeliveredByCarrier({ orderId, sellerId });
  if (cancelledCount === 0) return 0;

  logServerEvent("info", {
    event: "carrier.order_not_delivered_cancelled",
    carrier,
    orderId: String(orderId),
    cancelled: cancelledCount,
    prepaid,
  });
  await notifyCarrierNotDelivered({
    userId: buyerId,
    kind: IN_APP_NOTIFICATION_KIND_BUYER_ORDER_STATUS,
    message: BUYER_ORDER_CARRIER_NOT_DELIVERED_MESSAGE(prepaid),
    orderId,
  });
  await notifyCarrierNotDelivered({
    userId: String(sellerId),
    kind: IN_APP_NOTIFICATION_KIND_SELLER_ORDER_RETURNED,
    message: SELLER_ORDER_CARRIER_NOT_DELIVERED_MESSAGE,
    orderId,
  });
  return cancelledCount;
}
