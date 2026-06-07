import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `GET /order/sales` — список продаж текущего продавца (Bearer).
 *
 * @param {{
 *   page?: number;
 *   limit?: number;
 *   status?: import('../model/constants.js').ORDER_STATUSES[number] | "";
 *   search?: string;
 * }} [params]
 * @returns {Promise<{
 *   orders: import('../model/types.js').Order[];
 *   total: number;
 *   page: number;
 *   limit: number;
 * }>}
 */
export async function fetchMySales(params = {}) {
  try {
    const { page, limit, status, search } = params;
    const { data } = await apiClient.get("/order/sales", {
      params: {
        ...(page != null ? { page } : {}),
        ...(limit != null ? { limit } : {}),
        ...(status ? { status } : {}),
        ...(search ? { search } : {}),
      },
    });

    if (!data?.success || !Array.isArray(data.data?.orders)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      orders: data.data.orders,
      total: Number(data.data.total) || 0,
      page: Number(data.data.page) || page || 1,
      limit: Number(data.data.limit) || limit || 20,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.FETCH_MY_SALES_FALLBACK;
    throw new Error(message);
  }
}
