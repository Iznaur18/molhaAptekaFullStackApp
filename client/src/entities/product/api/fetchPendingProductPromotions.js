import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ page?: number; limit?: number }} [options]
 */
export async function fetchPendingProductPromotions({ page = 1, limit = 100 } = {}) {
  try {
    const { data } = await apiClient.get("/product/promotions/pending", {
      params: { page, limit },
    });
    if (!data?.success || !Array.isArray(data?.data?.promotions)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return {
      promotions: data.data.promotions,
      pagination: data.data.pagination,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_PRODUCT_PROMOTIONS_QUEUE_FALLBACK;
    throw new Error(message);
  }
}
