import { apiClient, parseReplaceCartData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import { coerceCartItemsFromApi } from "../lib/coerceCartItemsFromApi";
import type { CartItemsByProductId } from "../model/types";

export const replaceMyCart = async (items: CartItemsByProductId) => {
  try {
    const { data } = await apiClient.put("/cart", { items });
    const parsed = parseReplaceCartData(data);
    return coerceCartItemsFromApi(parsed.items);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.REPLACE_CART_FALLBACK));
  }
};
