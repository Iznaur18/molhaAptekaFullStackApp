import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `PATCH /product/:productId` — видимость в каталоге / доступность для заказа (Bearer).
 *
 * @param {string} productId
 * @param {boolean} productIsAvailable
 * @returns {Promise<import('../model/types.js').ProductFromApi>}
 */
export async function patchMyProductAvailability(productId, productIsAvailable) {
  try {
    const { data } = await apiClient.patch(`/product/${productId}`, {
      productIsAvailable,
    });

    if (!data?.success || data.data?.product == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.product;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.PATCH_MY_PRODUCT_AVAILABILITY_FALLBACK;
    throw new Error(message);
  }
}
