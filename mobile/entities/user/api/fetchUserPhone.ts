import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";

/** `GET /user/:userId/phone` */
export async function fetchUserPhone(userId: string): Promise<string> {
  try {
    const { data } = await apiClient.get(
      `/user/${encodeURIComponent(userId)}/phone`,
    );

    const phone = data?.data?.userPhoneNumber;
    if (!data?.success || typeof phone !== "string" || !phone.trim()) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return phone.trim();
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } }; message?: string };
    const message =
      err?.response?.data?.message ??
      err?.message ??
      API_CLIENT_UI.FETCH_USER_PROFILE_FALLBACK;
    throw new Error(message);
  }
}
