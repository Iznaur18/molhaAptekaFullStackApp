import { MY_ORDERS_LIST_FILTER_IN_PROGRESS } from "../model/myOrdersListFilters.js";
import { isOrderInProgress } from "./isOrderInProgress.js";
import { orderNeedsBuyerAttention } from "./orderNeedsBuyerAttention.js";

/**
 * @param {import("../model/types.js").Order} order
 * @param {{ status?: string; attentionOnly?: boolean }} filters
 */
export function orderMatchesMyOrdersFilters(
  order,
  { status = "", attentionOnly = false } = {},
) {
  if (status === MY_ORDERS_LIST_FILTER_IN_PROGRESS) {
    if (!isOrderInProgress(order)) {
      return false;
    }
  } else if (status && order.status !== status) {
    return false;
  }

  if (attentionOnly && !orderNeedsBuyerAttention(order)) {
    return false;
  }

  return true;
}

/**
 * @param {import("../model/types.js").Order[]} orders
 * @param {{ status?: string; attentionOnly?: boolean }} filters
 */
export function filterMyOrders(orders, filters = {}) {
  return orders.filter((order) => orderMatchesMyOrdersFilters(order, filters));
}
