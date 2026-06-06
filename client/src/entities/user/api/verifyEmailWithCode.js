import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/** `POST /auth/verify-email` */
export async function verifyEmailWithCode(code) {
  try {
    const { data } = await apiClient.post("/auth/verify-email", { code });

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.message ?? "";
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось подтвердить email";
    throw new Error(message);
  }
}
