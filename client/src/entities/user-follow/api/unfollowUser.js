import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `DELETE /user/:userId/follow`
 *
 * @param {string} userId
 */
export async function unfollowUser(userId) {
  try {
    const { data } = await apiClient.delete(`/user/${userId}/follow`);

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.UNFOLLOW_USER_FALLBACK;
    throw new Error(message);
  }
}
