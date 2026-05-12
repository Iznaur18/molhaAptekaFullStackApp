import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { coerceCartItemsFromApi } from "../lib/coerceCartItemsFromApi.js";

/**
 * `PUT /cart` — полная замена корзины на сервере.
 *
 * @param {import('../model/types.js').CartItemsByProductId} items
 * @returns {Promise<import('../model/types.js').CartItemsByProductId>}
 */
export async function replaceMyCart(items) {
  try {
    const { data } = await apiClient.put("/cart", { items });

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
      API_CLIENT_UI.REPLACE_CART_FALLBACK;
    throw new Error(message);
  }
}
