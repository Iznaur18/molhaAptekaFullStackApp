import {
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_SHIPPED,
} from "../model/constants.js";

/**
 * Зеркало `server/utils/orderActionCounts.js` → `countMyOrdersActionItems`.
 *
 * @param {import('../model/types.js').Order[] | undefined | null} orders
 */
export function countMyOrdersActionItemsFromOrders(orders) {
  let count = 0;

  for (const order of orders ?? []) {
    for (const item of order.items ?? []) {
      if (
        item.status === ORDER_STATUS_PENDING ||
        item.status === ORDER_STATUS_SHIPPED ||
        item.status === ORDER_STATUS_DELIVERED
      ) {
        count += 1;
      }
    }
  }

  return count;
}

/**
 * Зеркало `server/utils/orderActionCounts.js` → `countMySalesActionItems`
 * для заказов, где `items` уже отфильтрованы под текущего продавца (`GET /order/sales`).
 *
 * @param {import('../model/types.js').Order[] | undefined | null} orders
 */
export function countMySalesActionItemsFromOrders(orders) {
  let count = 0;

  for (const order of orders ?? []) {
    for (const item of order.items ?? []) {
      if (item.status === ORDER_STATUS_PENDING || item.status === ORDER_STATUS_SHIPPED) {
        count += 1;
      }
    }
  }

  return count;
}

/**
 * @param {unknown} cached
 */
export function isCompleteMySalesPageCache(cached) {
  if (Array.isArray(cached)) {
    return cached.length < 20;
  }

  if (!cached || typeof cached !== "object") {
    return false;
  }

  const page = /** @type {{ orders?: unknown[]; total?: number }} */ (cached);
  const orders = Array.isArray(page.orders) ? page.orders : [];
  const total = Number(page.total) || 0;

  return total <= orders.length;
}

/**
 * @param {unknown} cached
 * @returns {import('../model/types.js').Order[] | undefined}
 */
export function readMySalesOrdersFromCache(cached) {
  if (Array.isArray(cached)) {
    return cached;
  }

  if (!cached || typeof cached !== "object") {
    return undefined;
  }

  const orders = /** @type {{ orders?: import('../model/types.js').Order[] }} */ (
    cached
  ).orders;

  return Array.isArray(orders) ? orders : undefined;
}
