import { orderMatchesStatusFilter } from "@izibuy/shared-lib";

import { orderNeedsBuyerAttention } from "./orderNeedsBuyerAttention.js";

/**
 * Фильтр «Моих покупок»: группа («В работе», «Завершённые», «Отменённые»)
 * или точный статус из «Ещё статусы». Правила групп — в shared-lib.
 *
 * @param {import("../model/types.js").Order} order
 * @param {{ status?: string; attentionOnly?: boolean }} filters
 */
export function orderMatchesMyOrdersFilters(
  order,
  { status = "", attentionOnly = false } = {},
) {
  if (!orderMatchesStatusFilter(order, status)) {
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
