import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_RETURNED,
} from "../model/constants.js";

/**
 * Сумма заказа без отменённых и возвращённых позиций.
 * `order.totalAmount` при отмене позиции не пересчитывается на сервере.
 *
 * @param {{
 *   status?: string;
 *   totalAmount?: number;
 *   items?: Array<{ status?: string; quantity?: number; unitPriceAtOrder?: number }>;
 * }} order
 * @returns {number}
 */
export function resolveOrderActiveAmountRub(order) {
  if (
    order?.status === ORDER_STATUS_CANCELLED ||
    order?.status === ORDER_STATUS_RETURNED
  ) {
    return 0;
  }

  const items = Array.isArray(order?.items) ? order.items : [];
  if (items.length === 0) {
    return Number(order?.totalAmount) || 0;
  }

  let sum = 0;
  for (const item of items) {
    if (
      item?.status === ORDER_STATUS_CANCELLED ||
      item?.status === ORDER_STATUS_RETURNED
    ) {
      continue;
    }
    const quantity = Number(item?.quantity) || 0;
    const unitPrice = Number(item?.unitPriceAtOrder) || 0;
    sum += quantity * unitPrice;
  }
  return sum;
}
