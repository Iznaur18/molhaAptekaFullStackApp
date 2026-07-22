import { apiClient, clearAuthTokens, getRefreshToken } from "@/shared/api";
import { removePushToken } from "@/entities/push-token/api/pushTokenApi";
import { getExpoNotificationsModule } from "@/features/push-notifications/lib/expoNotificationsModule";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

const resolveStoredPushToken = async (): Promise<string | null> => {
  const Notifications = getExpoNotificationsModule();
  if (!Notifications) {
    return null;
  }
  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    return tokenResponse.data?.trim() || null;
  } catch {
    return null;
  }
};

export const logoutUser = async () => {
  try {
    const refreshToken = await getRefreshToken();
    const pushToken = await resolveStoredPushToken();
    if (pushToken) {
      await removePushToken(pushToken);
    }
    await apiClient.post("/auth/logout", refreshToken ? { refreshToken } : {});
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.LOGOUT_FALLBACK));
  } finally {
    await clearAuthTokens();
  }
};
