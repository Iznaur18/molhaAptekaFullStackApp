import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `GET /order` — список заказов текущего пользователя (Bearer).
 *
 * @returns {Promise<import('../model/types.js').Order[]>}
 */
export async function fetchMyOrders() {
  try {
    const { data } = await apiClient.get("/order");

    if (!data?.success || !Array.isArray(data.data?.orders)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.orders;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_MY_ORDERS_FALLBACK;
    throw new Error(message);
  }
}
