import { ORDER_STATUS_DELIVERED } from "../../constants/orderConstants.js";

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
