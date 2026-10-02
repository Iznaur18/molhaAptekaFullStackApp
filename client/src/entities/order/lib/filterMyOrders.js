import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_RETURNED,
} from "../model/constants.js";
import {
  MY_ORDERS_LIST_FILTER_CLOSED,
  MY_ORDERS_LIST_FILTER_DONE,
  MY_ORDERS_LIST_FILTER_IN_PROGRESS,
} from "../model/myOrdersListFilters.js";
import { isOrderInProgress } from "./isOrderInProgress.js";
import { orderNeedsBuyerAttention } from "./orderNeedsBuyerAttention.js";

/**
 * Фильтр «Моих покупок»: группа («В работе», «Завершённые», «Отменённые»)
 * или точный статус из «Ещё статусы».
 *
 * @param {import("../model/types.js").Order} order
 * @param {string} status
 */
function matchesStatusFilter(order, status) {
  if (!status) return true;
  if (status === MY_ORDERS_LIST_FILTER_IN_PROGRESS) return isOrderInProgress(order);
  if (status === MY_ORDERS_LIST_FILTER_DONE) {
    return order.status === ORDER_STATUS_CONFIRMED;
  }
  if (status === MY_ORDERS_LIST_FILTER_CLOSED) {
    return (
      order.status === ORDER_STATUS_CANCELLED || order.status === ORDER_STATUS_RETURNED
    );
  }
  return order.status === status;
}

/**
 * @param {import("../model/types.js").Order} order
 * @param {{ status?: string; attentionOnly?: boolean }} filters
 */
export function orderMatchesMyOrdersFilters(
  order,
  { status = "", attentionOnly = false } = {},
) {
  if (!matchesStatusFilter(order, status)) {
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
