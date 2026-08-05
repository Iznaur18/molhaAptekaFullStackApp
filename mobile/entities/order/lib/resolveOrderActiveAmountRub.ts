import { ORDER_STATUS_CANCELLED } from "@/entities/order/model/constants";

type OrderAmountRecord = {
  status?: string;
  totalAmount?: number;
  items?: Array<{ status?: string; quantity?: number; unitPriceAtOrder?: number }>;
};

/** Сумма заказа без отменённых позиций (`totalAmount` при cancel не пересчитывается). */
export const resolveOrderActiveAmountRub = (order: OrderAmountRecord): number => {
  if (order?.status === ORDER_STATUS_CANCELLED) {
    return 0;
  }

  const items = Array.isArray(order?.items) ? order.items : [];
  if (items.length === 0) {
    return Number(order?.totalAmount) || 0;
  }

  let sum = 0;
  for (const item of items) {
    if (item?.status === ORDER_STATUS_CANCELLED) {
      continue;
    }
    const quantity = Number(item?.quantity) || 0;
    const unitPrice = Number(item?.unitPriceAtOrder) || 0;
    sum += quantity * unitPrice;
  }
  return sum;
};
