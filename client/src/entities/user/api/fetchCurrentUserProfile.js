import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Текущий авторизованный пользователь: `GET /auth/me`.
 *
 * @returns {Promise<import('../model/types.js').UserPublicProfile>}
 */
export async function fetchCurrentUserProfile() {
  try {
    const { data } = await apiClient.get("/auth/me");

    if (!data?.success || !data.data?.user) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.user;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_ME_FALLBACK;
    throw new Error(message);
  }
}
