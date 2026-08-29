import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";

export async function blockUser(userId: string) {
  try {
    const { data } = await apiClient.post(`/user/${userId}/block`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (error) {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      (error instanceof Error ? error.message : API_CLIENT_UI.BLOCK_USER_FALLBACK);
    throw new Error(message);
  }
}
