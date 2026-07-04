import {
  ORDER_STATUS_PENDING,
  ORDER_STATUS_SHIPPED,
} from "../model/constants.js";
import { MY_SALES_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {import("../model/types.js").OrderLineItem} item
 */
export function orderLineItemNeedsSellerAttention(item) {
  return item.status === ORDER_STATUS_PENDING || item.status === ORDER_STATUS_SHIPPED;
}

/**
 * @param {import("../model/types.js").Order} order
 */
export function orderNeedsSellerAttention(order) {
  return (order.items ?? []).some(orderLineItemNeedsSellerAttention);
}

/**
 * @param {import("../model/types.js").Order} order
 */
export function resolveSellerOrderCollapsedPreview(order) {
  const items = order.items ?? [];
  const hasPending = items.some((item) => item.status === ORDER_STATUS_PENDING);
  const hasShipped = items.some((item) => item.status === ORDER_STATUS_SHIPPED);

  if (hasPending) {
    return MY_SALES_PAGE_UI.COLLAPSED_SHIP;
  }
  if (hasShipped) {
    return MY_SALES_PAGE_UI.COLLAPSED_DELIVER;
  }
  return null;
}
