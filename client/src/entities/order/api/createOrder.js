import { apiClient } from "../../../shared/api/index.js";
import { parseCreateOrderData } from "../../../shared/api/parseApiContract.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `POST /order` — оформление заказа авторизованным пользователем.
 *
 * @param {{
 *   items: { productId: string; quantity: number }[];
 *   deliveryAddress: string;
 *   deliveryAddressFlat: string;
 *   paymentMethod: import('../model/constants.js').ORDER_PAYMENT_METHODS[number];
 *   priceOfferId?: string;
 * }} payload
 * @returns {Promise<import('../model/types.js').Order>}
 */
export async function createOrder(payload) {
  try {
    const { data } = await apiClient.post("/order", payload);

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    const parsed = parseCreateOrderData(data);
    return parsed.order;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.CREATE_ORDER_FALLBACK;
    throw new Error(message);
  }
}
