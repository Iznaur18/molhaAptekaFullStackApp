import { apiClient } from "../../../shared/api/index.js";
import { parseReplaceCartData } from "../../../shared/api/parseApiContract.js";
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

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    const parsed = parseReplaceCartData(data);
    return coerceCartItemsFromApi(parsed.items);
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.REPLACE_CART_FALLBACK;
    throw new Error(message);
  }
}
