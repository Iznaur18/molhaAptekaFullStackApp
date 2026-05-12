import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { coerceCartItemsFromApi } from "../lib/coerceCartItemsFromApi.js";

/**
 * `GET /cart` — корзина текущего пользователя.
 *
 * @returns {Promise<import('../model/types.js').CartItemsByProductId>}
 */
export async function fetchMyCart() {
  try {
    const { data } = await apiClient.get("/cart");

    const rawItems = data.data?.items;
    if (
      !data?.success ||
      rawItems === null ||
      typeof rawItems !== "object" ||
      Array.isArray(rawItems)
    ) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return coerceCartItemsFromApi(rawItems);
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_CART_FALLBACK;
    throw new Error(message);
  }
}
