import { orderFromApiSchema } from "@molha/api-contract";
import type { z } from "zod";

import { apiClient } from "@/shared/api";
import { ADMIN_ORDERS_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type AdminOrder = z.infer<typeof orderFromApiSchema>;

export const fetchAllOrdersAdmin = async (params: {
  page?: number;
  limit?: number;
  status?: string;
} = {}) => {
  try {
    const { data } = await apiClient.get("/order/all", { params });
    if (!data?.success || !Array.isArray(data.data?.orders)) {
      throw new Error(ADMIN_ORDERS_PAGE_UI.FETCH_FALLBACK);
    }
    return {
      orders: data.data.orders as AdminOrder[],
      total: Number(data.data.total) || 0,
      page: Number(data.data.page) || 1,
      limit: Number(data.data.limit) || 20,
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, ADMIN_ORDERS_PAGE_UI.FETCH_FALLBACK));
  }
};
