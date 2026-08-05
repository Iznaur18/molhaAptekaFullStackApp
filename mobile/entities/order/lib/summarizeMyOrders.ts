import { isOrderInProgress } from "@/entities/order/lib/isOrderInProgress";
import { orderNeedsBuyerAttention } from "@/entities/order/lib/orderNeedsBuyerAttention";
import { resolveOrderActiveAmountRub } from "@/entities/order/lib/resolveOrderActiveAmountRub";

type OrderRecord = {
  status?: string;
  totalAmount?: number;
  items?: { status?: string; quantity?: number; unitPriceAtOrder?: number }[];
};

export const summarizeMyOrders = (orders: OrderRecord[]) => {
  let inProgressCount = 0;
  let attentionCount = 0;
  let totalAmountRub = 0;

  for (const order of orders) {
    totalAmountRub += resolveOrderActiveAmountRub(order);

    if (isOrderInProgress(order)) {
      inProgressCount += 1;
    }

    if (orderNeedsBuyerAttention(order)) {
      attentionCount += 1;
    }
  }

  return { inProgressCount, attentionCount, totalAmountRub };
};
