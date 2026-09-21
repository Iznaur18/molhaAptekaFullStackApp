import {
  ORDER_PRE_SHIPMENT_STATUSES,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_SHIPPED,
} from "../../constants/orderConstants.js";
import { OrderModel } from "../../models/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import { resolveItemSellerId } from "../order/orderShipments.js";

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
    logServerEvent("carrier.order_status_applied", {
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
    await markOrderItemReturned({ orderId, itemIndex: index, requestUserId: sellerId });
    moved += 1;
  }
  if (moved > 0) {
    logServerEvent("carrier.order_returned", {
      carrier,
      orderId: String(orderId),
      moved,
    });
  }
  return moved;
}
