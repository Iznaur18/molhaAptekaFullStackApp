import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `GET /user/:userId/phone` — reveal после rate limit.
 *
 * @param {string} userId
 * @returns {Promise<string>}
 */
export async function fetchUserPhone(userId) {
  try {
    const { data } = await apiClient.get(
      `/user/${encodeURIComponent(userId)}/phone`,
    );

    const phone = data?.data?.userPhoneNumber;
    if (!data?.success || typeof phone !== "string" || !phone.trim()) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return phone.trim();
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_USER_PROFILE_FALLBACK;
    throw new Error(message);
  }
}
