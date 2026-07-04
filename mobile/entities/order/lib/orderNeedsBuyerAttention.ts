import {
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_SHIPPED,
} from "@/entities/order/model/constants";
import { MY_ORDERS_PAGE_UI } from "@/shared/config";

type OrderLineItem = { status?: string };
type OrderRecord = { items?: OrderLineItem[] };

export const orderLineItemNeedsBuyerAttention = (item: OrderLineItem) =>
  item.status === ORDER_STATUS_PENDING ||
  item.status === ORDER_STATUS_SHIPPED ||
  item.status === ORDER_STATUS_DELIVERED;

export const orderNeedsBuyerAttention = (order: OrderRecord) =>
  (order.items ?? []).some(orderLineItemNeedsBuyerAttention);

export const resolveOrderCollapsedPreview = (order: OrderRecord) => {
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
};
