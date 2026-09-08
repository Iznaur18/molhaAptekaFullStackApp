import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Включить или снять продавцу публикацию товаров без модерации (только admin).
 *
 * @param {{ userId: string; trusted: boolean }} input
 * @returns {Promise<{ userId: string; productModerationTrusted: boolean }>}
 */
export async function patchSellerProductModerationTrust({ userId, trusted }) {
  try {
    const { data } = await apiClient.patch(
      `/staff/sellers/${encodeURIComponent(userId)}/product-moderation-trust`,
      { trusted },
    );
    const seller = data?.success ? data.data?.seller : null;
    if (!seller) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return seller;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.UPDATE_PROFILE_FALLBACK;
    throw new Error(message);
  }
}
