import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `POST /user/:userId/follow`
 *
 * @param {string} userId
 */
export async function followUser(userId) {
  try {
    const { data } = await apiClient.post(`/user/${userId}/follow`);

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.FOLLOW_USER_FALLBACK;
    throw new Error(message);
  }
}
