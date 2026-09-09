import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `PATCH /order/:orderId/shipment/:sellerId/cancelled`
 *
 * Гасит заказ целиком, а не построчно. Адресуется отправлением: карточка
 * заказа — и у покупателя, и у продавца — это заказ одного продавца.
 *
 * @param {{ orderId: string; sellerId: string }} params
 * @returns {Promise<import("../model/types.js").Order>}
 */
export async function cancelOrder({ orderId, sellerId }) {
  try {
    const { data } = await apiClient.patch(
      `/order/${orderId}/shipment/${sellerId}/cancelled`,
    );

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
