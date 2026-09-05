import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/** @param {unknown} e */
const toMessage = (e) =>
  e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.INVALID_SERVER_RESPONSE;

/**
 * `GET /sellers/commerce-defaults/me` — настройки доставки и оплаты продавца.
 *
 * @returns {Promise<import("../model/types.js").SellerCommerceDefaults>}
 */
export async function fetchMySellerCommerceDefaults() {
  try {
    const { data } = await apiClient.get("/sellers/commerce-defaults/me");
    if (!data?.success || !data.data?.defaults) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.defaults;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}

/**
 * `PUT /sellers/commerce-defaults` — сохранить и разослать по товарам.
 *
 * @param {{
 *   pickupLocations: Array<{ id?: string; label?: string; address: string; lat: number; lon: number; isDefault?: boolean }>;
 *   pickupEnabled: boolean;
 *   deliveryCarrier: string;
 *   paymentMethods: string[];
 *   regionCode?: string;
 * }} payload
 */
export async function saveMySellerCommerceDefaults(payload) {
  try {
    const { data } = await apiClient.put("/sellers/commerce-defaults", payload);
    if (!data?.success || !data.data?.defaults) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.defaults;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}
