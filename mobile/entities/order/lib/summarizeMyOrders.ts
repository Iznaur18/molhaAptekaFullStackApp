import { isOrderInProgress } from "@/entities/order/lib/isOrderInProgress";
import { orderNeedsBuyerAttention } from "@/entities/order/lib/orderNeedsBuyerAttention";

type OrderRecord = {
  status?: string;
  totalAmount?: number;
  items?: { status?: string }[];
};

export const summarizeMyOrders = (orders: OrderRecord[]) => {
  let inProgressCount = 0;
  let attentionCount = 0;
  let totalAmountRub = 0;

  for (const order of orders) {
    totalAmountRub += Number(order.totalAmount) || 0;

    if (isOrderInProgress(order)) {
      inProgressCount += 1;
    }

    if (orderNeedsBuyerAttention(order)) {
      attentionCount += 1;
    }
  }

  return { inProgressCount, attentionCount, totalAmountRub };
};
