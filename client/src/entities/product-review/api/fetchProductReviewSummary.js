import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 */
export async function fetchProductReviewSummary(productId) {
  try {
    const { data } = await apiClient.get(
      `/product/${productId}/reviews/summary`,
    );

    if (!data?.success || data.data == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return /** @type {import('../model/types.js').ProductReviewSummary} */ (
      data.data
    );
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_PRODUCT_REVIEW_SUMMARY_FALLBACK;
    throw new Error(message);
  }
}
