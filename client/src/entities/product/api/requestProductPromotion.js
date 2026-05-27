import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 * @param {{ tariffCode: string }} body
 */
export async function requestProductPromotion(productId, body) {
  try {
    const { data } = await apiClient.post(
      `/product/${productId}/promotions/request`,
      body,
    );
    if (!data?.success || !data?.data?.promotion) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.promotion;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.REQUEST_PRODUCT_PROMOTION_FALLBACK;
    throw new Error(message);
  }
}
