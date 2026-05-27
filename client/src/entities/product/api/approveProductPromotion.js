import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} promotionId
 */
export async function approveProductPromotion(promotionId) {
  try {
    const { data } = await apiClient.patch(
      `/product/promotions/${promotionId}/approve`,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.APPROVE_PRODUCT_PROMOTION_FALLBACK;
    throw new Error(message);
  }
}
