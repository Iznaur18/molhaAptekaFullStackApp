import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/** `POST /auth/resend-verification` */
export async function resendEmailVerification() {
  try {
    const { data } = await apiClient.post("/auth/resend-verification");

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.message ?? "";
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось отправить письмо";
    throw new Error(message);
  }
}
