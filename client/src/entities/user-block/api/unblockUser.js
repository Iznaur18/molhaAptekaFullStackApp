import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `DELETE /user/:userId/block`
 *
 * @param {string} userId
 * @param {{ asUserId?: string }} [options]
 */
export async function unblockUser(userId, options = {}) {
  try {
    const params = options.asUserId ? { asUserId: options.asUserId } : undefined;
    const { data } = await apiClient.delete(`/user/${userId}/block`, { params });

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.UNBLOCK_USER_FALLBACK;
    throw new Error(message);
  }
}
