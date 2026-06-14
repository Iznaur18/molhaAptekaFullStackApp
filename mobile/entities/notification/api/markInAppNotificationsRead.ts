import { apiClient, authMeQueryKeys } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const markInAppNotificationsRead = async (): Promise<void> => {
  try {
    const { data } = await apiClient.patch("/auth/me/in-app-notifications/read");
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.MARK_NOTIFICATIONS_READ_FALLBACK));
  }
};

export { authMeQueryKeys };
