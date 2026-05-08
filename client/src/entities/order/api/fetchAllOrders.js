import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `GET /order/all` — все заказы (только админ), пагинация и опц. фильтр по статусу.
 *
 * @param {{
 *   page?: number;
 *   limit?: number;
 *   status?: import('../model/constants.js').ORDER_STATUSES[number];
 * }} [params]
 * @returns {Promise<{
 *   orders: import('../model/types.js').Order[];
 *   total: number;
 *   page: number;
 *   limit: number;
 * }>}
 */
export async function fetchAllOrders(params = {}) {
  try {
    const { data } = await apiClient.get("/order/all", {
      params: {
        ...(params.page != null ? { page: params.page } : {}),
        ...(params.limit != null ? { limit: params.limit } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
    });

    if (!data?.success || !Array.isArray(data.data?.orders)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      orders: data.data.orders,
      total: Number(data.data.total) || 0,
      page: Number(data.data.page) || 1,
      limit: Number(data.data.limit) || 20,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_ALL_ORDERS_FALLBACK;
    throw new Error(message);
  }
}
