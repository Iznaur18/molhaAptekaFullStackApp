import { isOrderInProgress } from "@/entities/order/lib/isOrderInProgress";
import { orderNeedsBuyerAttention } from "@/entities/order/lib/orderNeedsBuyerAttention";
import { MY_ORDERS_LIST_FILTER_IN_PROGRESS } from "@/entities/order/model/myOrdersListFilters";

type OrderRecord = { status?: string; items?: { status?: string }[] };

export const orderMatchesMyOrdersFilters = (
  order: OrderRecord,
  { status = "", attentionOnly = false } = {},
): boolean => {
  if (status === MY_ORDERS_LIST_FILTER_IN_PROGRESS) {
    if (!isOrderInProgress(order)) {
      return false;
    }
  } else if (status && order.status !== status) {
    return false;
  }

  if (attentionOnly && !orderNeedsBuyerAttention(order)) {
    return false;
  }

  return true;
};

export const filterMyOrders = <T extends OrderRecord>(
  orders: T[],
  filters: { status?: string; attentionOnly?: boolean } = {},
): T[] => orders.filter((order) => orderMatchesMyOrdersFilters(order, filters));
