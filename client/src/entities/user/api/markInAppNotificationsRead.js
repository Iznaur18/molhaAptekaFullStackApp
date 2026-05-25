import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

export async function markInAppNotificationsRead() {
  try {
    const { data } = await apiClient.patch("/auth/me/in-app-notifications/read");

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.MARK_NOTIFICATIONS_READ_FALLBACK;
    throw new Error(message);
  }
}
