import { apiClient } from "../../../shared/api/index.js";
import { resetAuthSessionState } from "../../../shared/api/apiClient.js";
import { clearDevAuthTokens } from "../../../shared/api/devAuthTokenStorage.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

/**
 * Начало регистрации: аккаунт ещё не создан — сервер сохраняет заявку
 * и отправляет код на почту. Завершение — `confirmRegistration`.
 *
 * @param {import('../model/types.js').RegisterUserPayload} payload
 * @returns {Promise<{ registrationId: string; email: string }>}
 */
export async function registerUser(payload) {
  try {
    resetAuthSessionState();
    clearDevAuthTokens();
    await apiClient.post("/auth/logout").catch(() => {});

    const { data } = await apiClient.post("/auth/register", payload);

    if (
      !data?.success ||
      data?.data?.pendingRegistration !== true ||
      !data?.data?.registrationId
    ) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      registrationId: String(data.data.registrationId),
      email: String(data.data.email ?? ""),
    };
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, API_CLIENT_UI.REGISTER_FALLBACK));
  }
}
