import { apiClient } from "../../../shared/api/index.js";
import { resetAuthSessionState } from "../../../shared/api/apiClient.js";
import { API_CLIENT_UI, EMAIL_VERIFICATION_UI } from "../../../shared/config/appUiCopy.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

/**
 * Завершение регистрации: сервер проверяет код, создаёт аккаунт
 * и выдаёт сессию (httpOnly cookie + dev Bearer).
 *
 * @param {{ registrationId: string; code: string }} params
 */
export async function confirmRegistration({ registrationId, code }) {
  try {
    resetAuthSessionState();

    const { data } = await apiClient.post("/auth/register/confirm", {
      registrationId,
      code,
    });

    if (!data?.success || !data?.data?._id) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, EMAIL_VERIFICATION_UI.CONFIRM_ERROR));
  }
}
