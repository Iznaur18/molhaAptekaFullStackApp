import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_RETURNED,
} from "./orderStatus.js";

/**
 * Группы фильтра списков заказов («Мои покупки», «Мои продажи»; web и приложение).
 * Точный статус — это значение из `ORDER_STATUSES`, группа — одно из ниже.
 */

/** Всё, что ещё не закрыто. */
export const MY_ORDERS_LIST_FILTER_IN_PROGRESS = "in_progress";
/** Получение подтверждено — заказ закрыт успешно. */
export const MY_ORDERS_LIST_FILTER_DONE = "done";
/** Отменён или вернулся продавцу. */
export const MY_ORDERS_LIST_FILTER_CLOSED = "closed";

/** Порядок чипов-групп после «Все» и «Нужно действие». */
export const MY_ORDERS_LIST_GROUP_FILTERS = [
  MY_ORDERS_LIST_FILTER_IN_PROGRESS,
  MY_ORDERS_LIST_FILTER_DONE,
  MY_ORDERS_LIST_FILTER_CLOSED,
] as const;

export type MyOrdersListGroupFilter = (typeof MY_ORDERS_LIST_GROUP_FILTERS)[number];

type OrderLike = {
  status?: string | null;
  items?: readonly { status?: string | null }[] | null;
};

export function isOrderInProgress(order: OrderLike): boolean {
  if (
    order.status === ORDER_STATUS_CANCELLED ||
    order.status === ORDER_STATUS_RETURNED
  ) {
    return false;
  }

  return (order.items ?? []).some(
    (item) =>
      item.status !== ORDER_STATUS_CONFIRMED &&
      item.status !== ORDER_STATUS_CANCELLED &&
      item.status !== ORDER_STATUS_RETURNED,
  );
}

const GROUP_MATCHERS: Record<MyOrdersListGroupFilter, (order: OrderLike) => boolean> = {
  [MY_ORDERS_LIST_FILTER_IN_PROGRESS]: isOrderInProgress,
  [MY_ORDERS_LIST_FILTER_DONE]: (order) => order.status === ORDER_STATUS_CONFIRMED,
  [MY_ORDERS_LIST_FILTER_CLOSED]: (order) =>
    order.status === ORDER_STATUS_CANCELLED || order.status === ORDER_STATUS_RETURNED,
};

/** Группа («В работе», «Завершённые», «Отменённые»), а не точный статус. */
export function isMyOrdersListGroupFilter(
  filter: string,
): filter is MyOrdersListGroupFilter {
  return Object.prototype.hasOwnProperty.call(GROUP_MATCHERS, filter);
}

/**
 * Подходит ли заказ под фильтр статуса: пусто — все, группа — по правилу
 * группы, иначе — точный статус заказа.
 */
export function orderMatchesStatusFilter(order: OrderLike, filter: string): boolean {
  if (!filter) return true;
  if (isMyOrdersListGroupFilter(filter)) return GROUP_MATCHERS[filter](order);
  return order.status === filter;
}
