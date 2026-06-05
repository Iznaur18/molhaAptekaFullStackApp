import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 * @param {string} [productModerationComment]
 * @returns {Promise<import('../model/types.js').ProductFromApi>}
 */
export async function rejectProductModeration(
  productId,
  productModerationComment = "",
) {
  try {
    const { data } = await apiClient.patch(`/product/${productId}/moderation/reject`, {
      productModerationComment,
    });

    if (!data?.success || !data.data?.product) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.product;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.REJECT_PRODUCT_MODERATION_FALLBACK;
    throw new Error(message);
  }
}
