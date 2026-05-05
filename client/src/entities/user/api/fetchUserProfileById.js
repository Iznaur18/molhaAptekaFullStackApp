import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Публичный профиль: `GET /user/:userId` (см. `userGetProfileController`).
 *
 * @param {string} userId
 * @returns {Promise<import('../model/types.js').UserPublicProfile>}
 */
export async function fetchUserProfileById(userId) {
  try {
    const { data } = await apiClient.get(`/user/${encodeURIComponent(userId)}`);

    if (!data?.success || !data.data?.user) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.user;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_USER_PROFILE_FALLBACK;
    throw new Error(message);
  }
}
