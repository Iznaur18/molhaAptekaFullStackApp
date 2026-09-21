import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `GET /user/:userId/email` — почта по кнопке, с тем же лимитом, что телефон.
 *
 * @param {string} userId
 * @returns {Promise<string>}
 */
export async function fetchUserEmail(userId) {
  try {
    const { data } = await apiClient.get(`/user/${encodeURIComponent(userId)}/email`);

    const email = data?.data?.email;
    if (!data?.success || typeof email !== "string" || !email.trim()) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return email.trim();
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_USER_PROFILE_FALLBACK;
    throw new Error(message);
  }
}
