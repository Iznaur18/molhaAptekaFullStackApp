import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 * @returns {Promise<import('../model/types.js').ProductFromApi>}
 */
export async function approveProductModeration(productId) {
  try {
    const { data } = await apiClient.patch(`/product/${productId}/moderation/approve`);

    if (!data?.success || !data.data?.product) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.product;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.APPROVE_PRODUCT_MODERATION_FALLBACK;
    throw new Error(message);
  }
}
