import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ status?: string; page?: number; limit?: number }} [options]
 */
export async function fetchMyProductPromotions({ status, page = 1, limit = 100 } = {}) {
  try {
    const { data } = await apiClient.get("/product/promotions/my", {
      params: {
        page,
        limit,
        ...(status ? { status } : {}),
      },
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
      API_CLIENT_UI.FETCH_MY_PRODUCT_PROMOTIONS_FALLBACK;
    throw new Error(message);
  }
}
