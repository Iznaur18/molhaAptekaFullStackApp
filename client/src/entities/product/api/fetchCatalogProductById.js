import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 */
export async function fetchCatalogProductById(productId) {
  try {
    const { data } = await apiClient.get(`/product/${productId}/catalog`);

    if (!data?.success || data.data?.product == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return /** @type {import('../model/types.js').ProductFromApi} */ (
      data.data.product
    );
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_CATALOG_PRODUCT_FALLBACK;
    throw new Error(message);
  }
}
