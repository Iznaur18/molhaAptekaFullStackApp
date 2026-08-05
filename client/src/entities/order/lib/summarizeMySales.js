import { isOrderInProgress } from "./isOrderInProgress.js";
import { orderNeedsSellerAttention } from "./orderNeedsSellerAttention.js";
import { resolveOrderActiveAmountRub } from "./resolveOrderActiveAmountRub.js";

/**
 * @param {import("../model/types.js").Order[]} orders
 */
export function summarizeMySales(orders) {
  let inProgressCount = 0;
  let attentionCount = 0;
  let totalAmountRub = 0;

  for (const order of orders) {
    totalAmountRub += resolveOrderActiveAmountRub(order);

    if (isOrderInProgress(order)) {
      inProgressCount += 1;
    }

    if (orderNeedsSellerAttention(order)) {
      attentionCount += 1;
    }
  }

  return { inProgressCount, attentionCount, totalAmountRub };
}
