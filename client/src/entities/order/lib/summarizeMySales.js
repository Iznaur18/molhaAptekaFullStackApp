import { isOrderInProgress } from "./isOrderInProgress.js";
import { orderNeedsSellerAttention } from "./orderNeedsSellerAttention.js";

/**
 * @param {import("../model/types.js").Order[]} orders
 */
export function summarizeMySales(orders) {
  let inProgressCount = 0;
  let attentionCount = 0;
  let totalAmountRub = 0;

  for (const order of orders) {
    totalAmountRub += Number(order.totalAmount) || 0;

    if (isOrderInProgress(order)) {
      inProgressCount += 1;
    }

    if (orderNeedsSellerAttention(order)) {
      attentionCount += 1;
    }
  }

  return { inProgressCount, attentionCount, totalAmountRub };
}
