import { apiClient } from "../../../shared/api/index.js";
import { parseCreateOrderData } from "../../../shared/api/parseApiContract.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

/**
 * @param {{
 *   items: { productId: string; quantity: number }[];
 *   fulfillmentMethod?: string;
 *   deliveryAddress?: string;
 *   deliveryAddressFlat?: string;
 *   paymentMethod: import('../model/constants.js').ORDER_PAYMENT_METHODS[number];
 *   priceOfferId?: string;
 *   affiliateCode?: string;
 *   idempotencyKey: string;
 * }} payload
 */
export async function createOrder(payload) {
  try {
    const body = { ...payload };
    const code = String(payload.affiliateCode ?? "").trim();
    if (!code) {
      delete body.affiliateCode;
    }
    const { data } = await apiClient.post("/order", body);

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    const parsed = parseCreateOrderData(data);
    return parsed.order;
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, API_CLIENT_UI.CREATE_ORDER_FALLBACK));
  }
}
