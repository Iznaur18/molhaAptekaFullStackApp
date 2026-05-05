import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `DELETE /product/:productId` — удалить свой товар (Bearer).
 *
 * @param {string} productId
 * @returns {Promise<{ message?: string }>}
 */
export async function deleteMyProduct(productId) {
  try {
    const { data } = await apiClient.delete(`/product/${productId}`);

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data ?? {};
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.DELETE_MY_PRODUCT_FALLBACK;
    throw new Error(message);
  }
}
