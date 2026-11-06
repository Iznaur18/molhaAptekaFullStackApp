import {
  isMyOrdersListGroupFilter,
  orderMatchesStatusFilter,
} from "@izibuy/shared-lib";

import { orderNeedsSellerAttention } from "@/entities/order/lib/orderNeedsSellerAttention";

type OrderRecord = { status?: string; items?: { status?: string }[] };

/**
 * Фильтр «Моих продаж» (паритет web `filterMySales.js`): группы («В работе»,
 * «Завершённые», «Отменённые») считает приложение по правилам из shared-lib.
 * Точный статус сюда не доходит — им уже отфильтрован ответ сервера.
 */
export const filterMySales = <T extends OrderRecord>(
  orders: T[],
  { statusFilter = "", attentionOnly = false } = {},
): T[] => {
  let result = orders;

  if (isMyOrdersListGroupFilter(statusFilter)) {
    result = result.filter((order) => orderMatchesStatusFilter(order, statusFilter));
  }

  if (attentionOnly) {
    result = result.filter(orderNeedsSellerAttention);
  }

  return result;
};
