import {
  isMyOrdersListGroupFilter,
  orderMatchesStatusFilter,
} from "@izibuy/shared-lib";

import { orderNeedsSellerAttention } from "./orderNeedsSellerAttention.js";

/**
 * Группа статусов («В работе», «Завершённые», «Отменённые»), а не точный статус.
 * Группы считает клиент: сервер фильтрует только по точному статусу.
 *
 * @param {string} statusFilter
 */
export const isMySalesGroupFilter = (statusFilter) =>
  isMyOrdersListGroupFilter(statusFilter);

/**
 * Точный статус (из «Ещё статусы») сюда не доходит — им уже отфильтрован ответ.
 *
 * @param {import("../model/types.js").Order[]} orders
 * @param {{ statusFilter?: string; attentionOnly?: boolean }} filters
 */
export function filterMySales(
  orders,
  { statusFilter = "", attentionOnly = false } = {},
) {
  let result = orders;

  if (isMySalesGroupFilter(statusFilter)) {
    result = result.filter((order) => orderMatchesStatusFilter(order, statusFilter));
  }

  if (attentionOnly) {
    result = result.filter(orderNeedsSellerAttention);
  }

  return result;
}
