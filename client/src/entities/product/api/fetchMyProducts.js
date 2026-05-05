import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `GET /product/my` — товары текущего пользователя (Bearer).
 *
 * @returns {Promise<import('../model/types.js').ProductFromApi[]>}
 */
export async function fetchMyProducts() {
  try {
    const { data } = await apiClient.get("/product/my");

    if (!data?.success || !Array.isArray(data.data?.products)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.products;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_MY_PRODUCTS_FALLBACK;
    throw new Error(message);
  }
}
