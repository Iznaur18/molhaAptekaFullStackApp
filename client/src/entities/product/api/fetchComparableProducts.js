import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

/**
 * @param {string} productId
 * @returns {Promise<import('../model/types.js').ProductFromApi[]>}
 */
export async function fetchComparableProducts(productId) {
  const id = String(productId ?? "").trim();
  if (!id) {
    return [];
  }

  try {
    const { data } = await apiClient.get(`/product/${encodeURIComponent(id)}/compare`);
    if (!data?.success || !Array.isArray(data.data?.products)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.products;
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, API_CLIENT_UI.FETCH_PRODUCTS_FALLBACK));
  }
}
