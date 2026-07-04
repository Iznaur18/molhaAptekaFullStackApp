import { MY_ORDERS_LIST_FILTER_IN_PROGRESS } from "../model/myOrdersListFilters.js";
import { isOrderInProgress } from "./isOrderInProgress.js";
import { orderNeedsSellerAttention } from "./orderNeedsSellerAttention.js";

/**
 * @param {import("../model/types.js").Order[]} orders
 * @param {{ statusFilter?: string; attentionOnly?: boolean }} filters
 */
export function filterMySales(orders, { statusFilter = "", attentionOnly = false } = {}) {
  let result = orders;

  if (statusFilter === MY_ORDERS_LIST_FILTER_IN_PROGRESS) {
    result = result.filter(isOrderInProgress);
  }

  if (attentionOnly) {
    result = result.filter(orderNeedsSellerAttention);
  }

  return result;
}
