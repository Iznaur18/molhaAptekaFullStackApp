import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 * @param {{ tier: number; tariffCode: string }} body
 * @returns {Promise<{
 *   promotion: Record<string, unknown>;
 *   loyaltyPointsBalance: number | null;
 *   message: string | null;
 * }>}
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
    const pointsBalance = Number(data.data.loyaltyPointsBalance);
    return {
      promotion: data.data.promotion,
      loyaltyPointsBalance: Number.isFinite(pointsBalance) ? pointsBalance : null,
      message: typeof data.data.message === "string" ? data.data.message : null,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.REQUEST_PRODUCT_PROMOTION_FALLBACK;
    throw new Error(message);
  }
}
