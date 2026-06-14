import { apiClient, clearAuthTokens, getRefreshToken } from "@/shared/api";
import { removePushToken } from "@/entities/push-token/api/pushTokenApi";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const resolveStoredPushToken = async (): Promise<string | null> => {
  if (Platform.OS === "web") {
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
