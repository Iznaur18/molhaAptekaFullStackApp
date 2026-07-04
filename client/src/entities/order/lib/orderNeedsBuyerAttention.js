import {
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_SHIPPED,
} from "../model/constants.js";
import { MY_ORDERS_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {import("../model/types.js").OrderLineItem} item
 */
export function orderLineItemNeedsBuyerAttention(item) {
  return (
    item.status === ORDER_STATUS_PENDING ||
    item.status === ORDER_STATUS_SHIPPED ||
    item.status === ORDER_STATUS_DELIVERED
  );
}

/**
 * @param {import("../model/types.js").Order} order
 */
export function orderNeedsBuyerAttention(order) {
  return (order.items ?? []).some(orderLineItemNeedsBuyerAttention);
}

/**
 * @param {import("../model/types.js").Order} order
 */
export function resolveOrderCollapsedPreview(order) {
  const items = order.items ?? [];
  const hasDelivered = items.some((item) => item.status === ORDER_STATUS_DELIVERED);
  const hasPending = items.some((item) => item.status === ORDER_STATUS_PENDING);
  const hasShipped = items.some((item) => item.status === ORDER_STATUS_SHIPPED);

  if (hasDelivered) {
    return MY_ORDERS_PAGE_UI.COLLAPSED_CONFIRM;
  }
  if (hasPending) {
    return MY_ORDERS_PAGE_UI.COLLAPSED_PENDING;
  }
  if (hasShipped) {
    return MY_ORDERS_PAGE_UI.COLLAPSED_SHIPPED;
  }
  return null;
}
