import { apiClient, parseMyCartData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import { coerceCartItemsFromApi } from "../lib/coerceCartItemsFromApi";

export const fetchMyCart = async () => {
  try {
    const { data } = await apiClient.get("/cart");
    const parsed = parseMyCartData(data);
    return coerceCartItemsFromApi(parsed.items);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_CART_FALLBACK));
  }
};
