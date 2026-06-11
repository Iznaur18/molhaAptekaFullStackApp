import { favoritesListDataSchema } from "@molha/api-contract";

import { apiClient } from "../../../shared/api/apiClient.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { coerceWishlistItemsFromApi } from "../lib/coerceWishlistItemsFromApi.js";

/**
 * `PUT /favorites` — полная замена списка желаний.
 *
 * @param {import('../model/types.js').WishlistItemsByProductId} items
 * @returns {Promise<import('../model/types.js').WishlistFromApi>}
 */
export async function replaceMyFavorites(items) {
  try {
    const { data } = await apiClient.put("/favorites", { items });

    const payload = data.data;
    if (!data?.success || payload == null || typeof payload !== "object") {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    const parsed = favoritesListDataSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      items: coerceWishlistItemsFromApi(parsed.data.items),
      products: parsed.data.products,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.REPLACE_WISHLIST_FALLBACK;
    throw new Error(message);
  }
}
