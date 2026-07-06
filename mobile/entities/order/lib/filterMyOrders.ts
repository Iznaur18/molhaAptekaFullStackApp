import { isOrderInProgress } from "@/entities/order/lib/isOrderInProgress";
import { orderNeedsBuyerAttention } from "@/entities/order/lib/orderNeedsBuyerAttention";
import { MY_ORDERS_LIST_FILTER_IN_PROGRESS } from "@/entities/order/model/myOrdersListFilters";

type OrderRecord = { status?: string; items?: { status?: string }[] };

export const filterMyOrders = <T extends OrderRecord>(
  orders: T[],
  { status = "", attentionOnly = false } = {},
): T[] => {
  let result = orders;

  if (status === MY_ORDERS_LIST_FILTER_IN_PROGRESS) {
    result = result.filter(isOrderInProgress);
  } else if (status) {
    result = result.filter((order) => order.status === status);
  }

  if (attentionOnly) {
    result = result.filter(orderNeedsBuyerAttention);
  }

  return result;
};
