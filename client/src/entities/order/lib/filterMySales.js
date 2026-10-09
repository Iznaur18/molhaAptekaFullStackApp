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
import { orderNeedsSellerAttention } from "./orderNeedsSellerAttention.js";

/**
 * Группы статусов считает сайт: сервер фильтрует только по точному статусу.
 * Точный статус (из «Ещё статусы») сюда не доходит — им уже отфильтрован ответ.
 *
 * @type {Record<string, (order: import("../model/types.js").Order) => boolean>}
 */
const MY_SALES_GROUP_FILTERS = {
  [MY_ORDERS_LIST_FILTER_IN_PROGRESS]: isOrderInProgress,
  [MY_ORDERS_LIST_FILTER_DONE]: (order) => order.status === ORDER_STATUS_CONFIRMED,
  [MY_ORDERS_LIST_FILTER_CLOSED]: (order) =>
    order.status === ORDER_STATUS_CANCELLED || order.status === ORDER_STATUS_RETURNED,
};

/**
 * Группа статусов («В работе», «Завершённые», «Отменённые»), а не точный статус.
 *
 * @param {string} statusFilter
 */
export const isMySalesGroupFilter = (statusFilter) =>
  Object.prototype.hasOwnProperty.call(MY_SALES_GROUP_FILTERS, statusFilter);

/**
 * @param {import("../model/types.js").Order[]} orders
 * @param {{ statusFilter?: string; attentionOnly?: boolean }} filters
 */
export function filterMySales(
  orders,
  { statusFilter = "", attentionOnly = false } = {},
) {
  let result = orders;

  if (isMySalesGroupFilter(statusFilter)) {
    result = result.filter(MY_SALES_GROUP_FILTERS[statusFilter]);
  }

  if (attentionOnly) {
    result = result.filter(orderNeedsSellerAttention);
  }

  return result;
}
