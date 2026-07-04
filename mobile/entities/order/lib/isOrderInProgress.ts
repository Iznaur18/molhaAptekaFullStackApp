import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
} from "@/entities/order/model/constants";

type OrderLineItem = { status?: string };
type OrderRecord = { status?: string; items?: OrderLineItem[] };

export const isOrderInProgress = (order: OrderRecord) => {
  if (order.status === ORDER_STATUS_CANCELLED) {
    return false;
  }

  return (order.items ?? []).some(
    (item) =>
      item.status !== ORDER_STATUS_CONFIRMED && item.status !== ORDER_STATUS_CANCELLED,
  );
};
