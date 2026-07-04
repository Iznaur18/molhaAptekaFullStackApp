import { MY_ORDERS_LIST_FILTER_IN_PROGRESS } from "../model/myOrdersListFilters.js";
import { isOrderInProgress } from "./isOrderInProgress.js";
import { orderNeedsBuyerAttention } from "./orderNeedsBuyerAttention.js";

/**
 * @param {import("../model/types.js").Order[]} orders
 * @param {{ status?: string; attentionOnly?: boolean }} filters
 */
export function filterMyOrders(orders, { status = "", attentionOnly = false } = {}) {
  let result = orders;

  if (status === MY_ORDERS_LIST_FILTER_IN_PROGRESS) {
    result = result.filter(isOrderInProgress);
  } else if (status) {
    result = result.filter((order) => order.status === status);
  }

  if (attentionOnly) {
    result = result.filter(orderNeedsBuyerAttention);
  }

  return result;
}
