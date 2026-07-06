import { isOrderInProgress } from "@/entities/order/lib/isOrderInProgress";
import { orderNeedsSellerAttention } from "@/entities/order/lib/orderNeedsSellerAttention";
import { MY_ORDERS_LIST_FILTER_IN_PROGRESS } from "@/entities/order/model/myOrdersListFilters";

type OrderRecord = { status?: string; items?: { status?: string }[] };

export const filterMySales = <T extends OrderRecord>(
  orders: T[],
  { statusFilter = "", attentionOnly = false } = {},
): T[] => {
  let result = orders;

  if (statusFilter === MY_ORDERS_LIST_FILTER_IN_PROGRESS) {
    result = result.filter(isOrderInProgress);
  }

  if (attentionOnly) {
    result = result.filter(orderNeedsSellerAttention);
  }

  return result;
};
