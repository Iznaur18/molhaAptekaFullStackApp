import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} userId
 * @returns {Promise<void>}
 */
export async function deleteUserProfile(userId) {
  try {
    const { data } = await apiClient.delete(
      `/user/${encodeURIComponent(userId)}`,
    );

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.DELETE_USER_FALLBACK;
    throw new Error(message);
  }
}
