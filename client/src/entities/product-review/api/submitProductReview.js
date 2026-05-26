import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 * @param {{ rating: number; text?: string }} payload
 */
export async function submitProductReview(productId, payload) {
  try {
    const { data } = await apiClient.post(`/product/${productId}/reviews`, payload);

    if (!data?.success || data.data?.review == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.SUBMIT_PRODUCT_REVIEW_FALLBACK;
    throw new Error(message);
  }
}
