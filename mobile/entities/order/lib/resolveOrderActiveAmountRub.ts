import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_RETURNED,
  summarizeOrderItems,
} from "@izibuy/shared-lib";

type OrderAmountRecord = {
  status?: string;
  totalAmount?: number;
  items?: Array<{ status?: string; quantity?: number; unitPriceAtOrder?: number }>;
};

/** Сумма заказа без отменённых позиций (`totalAmount` при cancel не пересчитывается). */
export const resolveOrderActiveAmountRub = (order: OrderAmountRecord): number => {
  if (
    order?.status === ORDER_STATUS_CANCELLED ||
    order?.status === ORDER_STATUS_RETURNED
  ) {
    return 0;
  }

  const items = Array.isArray(order?.items) ? order.items : [];
  if (items.length === 0) {
    return Number(order?.totalAmount) || 0;
  }

  return summarizeOrderItems(items).totalAmount;
};
