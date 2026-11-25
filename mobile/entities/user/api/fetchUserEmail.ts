import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";

/** `GET /user/:userId/email` — почта по кнопке, с тем же лимитом, что телефон. */
export async function fetchUserEmail(userId: string): Promise<string> {
  try {
    const { data } = await apiClient.get(`/user/${encodeURIComponent(userId)}/email`);

    const email = data?.data?.email;
    if (!data?.success || typeof email !== "string" || !email.trim()) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return email.trim();
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } }; message?: string };
    const message =
      err?.response?.data?.message ??
      err?.message ??
      API_CLIENT_UI.FETCH_USER_PROFILE_FALLBACK;
    throw new Error(message);
  }
}
