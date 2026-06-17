import { apiClient } from "../../../shared/api/index.js";
import { resetAuthSessionState } from "../../../shared/api/apiClient.js";
import { clearDevAuthTokens } from "../../../shared/api/devAuthTokenStorage.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

/**
 * Регистрация. JWT: httpOnly cookie + dev Bearer (sessionStorage).
 *
 * @param {import('../model/types.js').RegisterUserPayload} payload
 */
export async function registerUser(payload) {
  try {
    resetAuthSessionState();
    clearDevAuthTokens();
    await apiClient.post("/auth/logout").catch(() => {});

    const { data } = await apiClient.post("/auth/register", payload);

    if (!data?.success || !data?.data?._id) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, API_CLIENT_UI.REGISTER_FALLBACK));
  }
}
