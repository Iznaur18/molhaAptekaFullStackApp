import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<Record<string, unknown>[]>}
 */
export async function fetchPendingProductPromotions() {
  try {
    const { data } = await apiClient.get("/product/promotions/pending");
    if (!data?.success || !Array.isArray(data.data?.promotions)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.promotions;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_PRODUCT_PROMOTIONS_QUEUE_FALLBACK;
    throw new Error(message);
  }
}
