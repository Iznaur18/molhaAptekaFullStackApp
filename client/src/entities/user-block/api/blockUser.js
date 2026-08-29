import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `POST /user/:userId/block`
 *
 * @param {string} userId
 */
export async function blockUser(userId) {
  try {
    const { data } = await apiClient.post(`/user/${userId}/block`);

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.BLOCK_USER_FALLBACK;
    throw new Error(message);
  }
}
