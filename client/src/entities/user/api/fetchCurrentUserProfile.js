import { apiClient } from "../../../shared/api/index.js";
import { parseAuthMeData } from "../../../shared/api/parseApiContract.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Текущий авторизованный пользователь: `GET /auth/me`.
 *
 * @returns {Promise<{
 *   user: import('../model/types.js').UserPublicProfile;
 *   inAppNotifications: import('../../product-report/model/types.js').UserInAppNotification[];
 * }>}
 */
/** Проверяет, что httpOnly cookie сессии реально работают. */
export async function establishAuthSession() {
  return fetchCurrentUserProfile();
}

export async function fetchCurrentUserProfile() {
  try {
    const { data } = await apiClient.get("/auth/me");

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return parseAuthMeData(data);
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.FETCH_ME_FALLBACK;
    throw new Error(message);
  }
}
