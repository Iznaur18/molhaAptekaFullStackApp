import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ page?: number; limit?: number }} [options]
 * @returns {Promise<{
 *   products: import('../model/types.js').ProductFromApi[];
 *   total: number;
 *   page: number;
 *   limit: number;
 *   totalPages: number;
 * }>}
 */
export async function fetchPendingModerationProducts({ page = 1, limit = 20 } = {}) {
  try {
    const { data } = await apiClient.get("/product/moderation/pending", {
      params: { page, limit },
    });

    if (!data?.success || !Array.isArray(data.data?.products)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      products: data.data.products,
      total: Number(data.data.total) || 0,
      page: Number(data.data.page) || page,
      limit: Number(data.data.limit) || limit,
      totalPages: Number(data.data.totalPages) || 0,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_MODERATION_QUEUE_FALLBACK;
    throw new Error(message);
  }
}
