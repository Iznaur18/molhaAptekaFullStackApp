import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { AdminOrder } from "./fetchAllOrdersAdmin";

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const { data } = await apiClient.patch(`/order/${orderId}/status`, { status });
    if (!data?.success || !data.data?.order) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.order as AdminOrder;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK));
  }
};
