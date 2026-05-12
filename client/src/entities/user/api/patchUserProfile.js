import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Обновление профиля: `PATCH /user/:userId`.
 *
 * @param {string} userId
 * @param {Record<string, unknown>} body
 * @returns {Promise<import('../model/types.js').UserPublicProfile>}
 */
export async function patchUserProfile(userId, body) {
  try {
    const { data } = await apiClient.patch(
      `/user/${encodeURIComponent(userId)}`,
      body,
    );

    if (!data?.success || !data.data?.user) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.user;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.UPDATE_PROFILE_FALLBACK;
    throw new Error(message);
  }
}
