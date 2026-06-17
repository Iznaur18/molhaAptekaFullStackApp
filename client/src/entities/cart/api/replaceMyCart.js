import { apiClient } from "../../../shared/api/index.js";
import { parseReplaceCartData } from "../../../shared/api/parseApiContract.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { coerceCartItemsFromApi } from "../lib/coerceCartItemsFromApi.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

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
    throw new Error(formatApiErrorMessage(e, API_CLIENT_UI.REPLACE_CART_FALLBACK));
  }
}
