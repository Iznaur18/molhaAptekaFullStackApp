import { isOrderInProgress } from "./isOrderInProgress.js";
import { orderNeedsBuyerAttention } from "./orderNeedsBuyerAttention.js";

/**
 * @param {import("../model/types.js").Order[]} orders
 */
export function summarizeMyOrders(orders) {
  let inProgressCount = 0;
  let attentionCount = 0;
  let totalAmountRub = 0;

  for (const order of orders) {
    totalAmountRub += Number(order.totalAmount) || 0;

    if (isOrderInProgress(order)) {
      inProgressCount += 1;
    }

    if (orderNeedsBuyerAttention(order)) {
      attentionCount += 1;
    }
  }

  return { inProgressCount, attentionCount, totalAmountRub };
}
