import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `PATCH /order/:orderId/status` — смена статуса заказа (только админ).
 *
 * @param {string} orderId
 * @param {import('../model/constants.js').ORDER_STATUSES[number]} status
 * @returns {Promise<import('../model/types.js').Order>}
 */
export async function updateOrderStatus(orderId, status) {
  try {
    const { data } = await apiClient.patch(`/order/${orderId}/status`, {
      status,
    });

    if (!data?.success || !data.data?.order) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.order;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
    throw new Error(message);
  }
}
