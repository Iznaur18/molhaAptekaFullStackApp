import {
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_LADDER_RANK,
  ORDER_STATUS_COURIER_HOLDING,
} from "../../constants/orderConstants.js";

import { resolveItemSellerId } from "./orderShipments.js";
import { buildOrderStatusFromItems } from "./orderStatus.js";

/**
 * Убирает коды передачи из ответа и возвращает только тот, что положен
 * этой стороне.
 *
 * Оба кода лежат на отправлении, и без чистки они уезжали бы всем: покупатель
 * видел бы код передачи и мог назвать его курьеру, не дожидаясь, пока продавец
 * что-то отдаст. Тогда рукопожатие теряет смысл — а оно и есть единственное
 * доказательство, что продавец и курьер стояли рядом.
 *
 * Покупателю оставляем код вручения, и только когда курьер уже привёз: раньше
 * он не нужен, а лишний повод его показать — лишний повод его слить.
 *
 * @param {Record<string, any> | null | undefined} order
 * @param {"buyer" | "seller" | "courier"} audience
 */
export const stripShipmentCodes = (order, audience) => {
  if (!order || !Array.isArray(order.shipments)) return order;

  for (const shipment of order.shipments) {
    if (!shipment) continue;

    const keepDeliveryCode =
      audience === "buyer" && isShipmentDelivered(order, shipment.sellerId);

    delete shipment.handoverCode;
    if (!keepDeliveryCode) {
      delete shipment.deliveryCode;
    }
    delete shipment.handoverAttempts;
    delete shipment.deliveryAttempts;

    // Реквизиты продавца покупатель видит, только когда товар уже едет:
    // до передачи переводить некуда и незачем.
    if (audience !== "buyer" || !isShipmentUnderway(order, shipment.sellerId)) {
      delete shipment.sellerPayoutRequisites;
    }
  }

  return order;
};

/**
 * @param {Record<string, any>} order
 * @param {unknown} sellerId
 */
function isShipmentDelivered(order, sellerId) {
  const items = (order.items ?? []).filter(
    (item) => resolveItemSellerId(item) === String(sellerId),
  );
  return items.length > 0 && buildOrderStatusFromItems(items) === ORDER_STATUS_DELIVERED;
}

/**
 * Товар у курьера или дальше — значит передача состоялась.
 *
 * @param {Record<string, any>} order
 * @param {unknown} sellerId
 */
function isShipmentUnderway(order, sellerId) {
  const items = (order.items ?? []).filter(
    (item) => resolveItemSellerId(item) === String(sellerId),
  );
  if (items.length === 0) return false;

  const status = buildOrderStatusFromItems(items);
  const rank = ORDER_STATUS_LADDER_RANK[status];
  return rank !== undefined && rank >= ORDER_STATUS_LADDER_RANK[ORDER_STATUS_COURIER_HOLDING];
}
