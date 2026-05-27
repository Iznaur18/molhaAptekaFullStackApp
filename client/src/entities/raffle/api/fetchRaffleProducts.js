import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} raffleId
 * @param {{ page?: number; limit?: number; search?: string }} [params]
 */
export async function fetchRaffleProducts(raffleId, params = {}) {
  try {
    const { data } = await apiClient.get(`/product/raffles/${raffleId}/products`, {
      params,
    });
    if (!data?.success || !Array.isArray(data.data?.products)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return {
      products: data.data.products,
      pagination: data.data.pagination ?? null,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_RAFFLE_PRODUCTS_FALLBACK;
    throw new Error(message);
  }
}
