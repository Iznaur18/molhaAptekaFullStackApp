import { apiClient } from "@/shared/api";
import { formatApiErrorMessage } from "@/shared/lib";

export type PushTokenPlatform = "ios" | "android" | "web";

export const registerPushToken = async (token: string, platform: PushTokenPlatform) => {
  try {
    const { data } = await apiClient.put("/auth/me/push-token", { token, platform });
    if (!data?.success) {
      throw new Error("Не удалось зарегистрировать push token");
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось зарегистрировать push token"));
  }
};

export const removePushToken = async (token: string) => {
  try {
    await apiClient.delete("/auth/me/push-token", { data: { token } });
  } catch {
    // logout path — не блокируем выход
  }
};
