import {
  ORDER_STATUS_ACCEPTED,
  ORDER_STATUS_ASSEMBLING,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_READY_FOR_PICKUP,
  ORDER_STATUS_READY_TO_SHIP,
  SHIPMENT_ADVANCE_BUTTON_LABEL_RU,
} from "../model/constants.js";

/**
 * Совпадает с `NEXT_STATUS_BY_CURRENT` в
 * `server/services/order/advanceShipmentStatus.js`. Сервер всё равно
 * проверяет переход сам — здесь только чтобы нарисовать нужную кнопку.
 */
const NEXT_BY_CURRENT = {
  [ORDER_STATUS_PENDING]: () => ORDER_STATUS_ACCEPTED,
  [ORDER_STATUS_ACCEPTED]: () => ORDER_STATUS_ASSEMBLING,
  [ORDER_STATUS_ASSEMBLING]: (fulfillmentMethod) =>
    fulfillmentMethod === "delivery"
      ? ORDER_STATUS_READY_TO_SHIP
      : ORDER_STATUS_READY_FOR_PICKUP,
};

/**
 * Следующая ступень отправления, или `null` если двигать некуда.
 *
 * @param {string} currentStatus
 * @param {"pickup" | "delivery"} fulfillmentMethod
 * @returns {string | null}
 */
export function resolveNextShipmentStatus(currentStatus, fulfillmentMethod) {
  const step = NEXT_BY_CURRENT[currentStatus];
  return step ? step(fulfillmentMethod) : null;
}

/**
 * Подпись кнопки перехода, или `null` если кнопку показывать не нужно.
 *
 * @param {string} currentStatus
 * @param {"pickup" | "delivery"} fulfillmentMethod
 * @returns {{ nextStatus: string; label: string } | null}
 */
export function resolveShipmentAdvanceAction(currentStatus, fulfillmentMethod) {
  const nextStatus = resolveNextShipmentStatus(currentStatus, fulfillmentMethod);
  if (!nextStatus) return null;

  const label = SHIPMENT_ADVANCE_BUTTON_LABEL_RU[nextStatus];
  return label ? { nextStatus, label } : null;
}
