import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `GET /user/:userId/purchases` — последние уникальные покупки (Bearer).
 *
 * @param {string} userId
 * @returns {Promise<import('../model/userPurchaseTypes.js').UserPurchaseListItem[]>}
 */
export async function fetchUserPurchases(userId) {
  try {
    const { data } = await apiClient.get(
      `/user/${encodeURIComponent(userId)}/purchases`,
    );

    if (!data?.success || !Array.isArray(data.data?.items)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.items;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_USER_PURCHASES_FALLBACK;
    throw new Error(message);
  }
}
