import {
  ORDER_STATUS_PENDING,
  ORDER_STATUS_SHIPPED,
} from "@/entities/order/model/constants";
import { MY_SALES_PAGE_UI } from "@/shared/config";

type OrderLineItem = { status?: string };
type OrderRecord = { items?: OrderLineItem[] };

export const orderLineItemNeedsSellerAttention = (item: OrderLineItem) =>
  item.status === ORDER_STATUS_PENDING || item.status === ORDER_STATUS_SHIPPED;

export const orderNeedsSellerAttention = (order: OrderRecord) =>
  (order.items ?? []).some(orderLineItemNeedsSellerAttention);

export const resolveSellerOrderCollapsedPreview = (order: OrderRecord) => {
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
};
