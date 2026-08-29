import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";

type UnblockUserOptions = {
  asUserId?: string;
};

export async function unblockUser(userId: string, options: UnblockUserOptions = {}) {
  try {
    const params = options.asUserId ? { asUserId: options.asUserId } : undefined;
    const { data } = await apiClient.delete(`/user/${userId}/block`, { params });
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (error) {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      (error instanceof Error ? error.message : API_CLIENT_UI.UNBLOCK_USER_FALLBACK);
    throw new Error(message);
  }
}
