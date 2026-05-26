import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { PRODUCT_REVIEW_PAGE_LIMIT } from "../model/constants.js";

/**
 * @param {string} productId
 * @param {{ page?: number; limit?: number }} [params]
 */
export async function fetchProductReviewsPage(productId, params = {}) {
  try {
    const page = params.page ?? 1;
    const limit = params.limit ?? PRODUCT_REVIEW_PAGE_LIMIT;
    const { data } = await apiClient.get(`/product/${productId}/reviews`, {
      params: { page, limit },
    });

    if (!data?.success || !Array.isArray(data.data?.reviews)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      reviews: /** @type {import('../model/types.js').ProductReviewFromApi[]} */ (
        data.data.reviews
      ),
      pagination: /** @type {import('../model/types.js').ProductReviewPagination} */ (
        data.data.pagination
      ),
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_PRODUCT_REVIEWS_FALLBACK;
    throw new Error(message);
  }
}
