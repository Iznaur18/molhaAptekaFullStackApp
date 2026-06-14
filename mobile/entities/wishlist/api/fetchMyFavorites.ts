import { favoritesListDataSchema } from "@molha/api-contract";

import { apiClient, parseApiContractData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import { coerceWishlistItemsFromApi } from "../lib/coerceWishlistItemsFromApi";
import type { WishlistFromApi } from "../model/types";

export const fetchMyFavorites = async (): Promise<WishlistFromApi> => {
  try {
    const { data } = await apiClient.get("/favorites");
    const parsed = parseApiContractData(data, favoritesListDataSchema);
    return {
      items: coerceWishlistItemsFromApi(parsed.items),
      products: parsed.products,
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_WISHLIST_FALLBACK));
  }
};
