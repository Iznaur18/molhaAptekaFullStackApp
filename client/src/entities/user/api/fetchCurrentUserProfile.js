import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Текущий авторизованный пользователь: `GET /auth/me`.
 *
 * @returns {Promise<{
 *   user: import('../model/types.js').UserPublicProfile;
 *   inAppNotifications: import('../../product-report/model/types.js').UserInAppNotification[];
 * }>}
 */
export async function fetchCurrentUserProfile() {
  try {
    const { data } = await apiClient.get("/auth/me");

    if (!data?.success || !data.data?.user) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    const notifications = Array.isArray(data.data.inAppNotifications)
      ? data.data.inAppNotifications
      : [];

    return {
      user: data.data.user,
      inAppNotifications: notifications,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_ME_FALLBACK;
    throw new Error(message);
  }
}
