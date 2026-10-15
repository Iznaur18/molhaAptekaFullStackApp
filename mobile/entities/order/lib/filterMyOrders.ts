import { orderMatchesStatusFilter } from "@izibuy/shared-lib";

import { orderNeedsBuyerAttention } from "@/entities/order/lib/orderNeedsBuyerAttention";

type OrderRecord = { status?: string; items?: { status?: string }[] };

/**
 * Фильтр «Моих покупок»: группа («В работе», «Завершённые», «Отменённые»)
 * или точный статус из «Ещё статусы». Правила групп — в shared-lib.
 */
export const orderMatchesMyOrdersFilters = (
  order: OrderRecord,
  { status = "", attentionOnly = false } = {},
): boolean => {
  if (!orderMatchesStatusFilter(order, status)) {
    return false;
  }

  if (attentionOnly && !orderNeedsBuyerAttention(order)) {
    return false;
  }

  return true;
};

export const filterMyOrders = <T extends OrderRecord>(
  orders: T[],
  filters: { status?: string; attentionOnly?: boolean } = {},
): T[] => orders.filter((order) => orderMatchesMyOrdersFilters(order, filters));
