import { apiClient } from "../../../shared/api/index.js";
import { resetAuthSessionState } from "../../../shared/api/apiClient.js";
import { clearDevAuthTokens } from "../../../shared/api/devAuthTokenStorage.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

/**
 * Логин по email + password. JWT: httpOnly cookie + dev Bearer (sessionStorage).
 *
 * @param {{ email: string; password: string }} credentials
 */
export async function loginUser(credentials) {
  try {
    resetAuthSessionState();
    clearDevAuthTokens();
    await apiClient.post("/auth/logout").catch(() => {});

    const { data } = await apiClient.post("/auth/login", credentials);

    if (!data?.success || !data?.data?._id) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, API_CLIENT_UI.LOGIN_FALLBACK));
  }
}
