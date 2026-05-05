import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Логин по email + password.
 *
 * @param {{ email: string; password: string }} credentials
 * @returns {Promise<{ token: string }>}
 */
export async function loginUser(credentials) {
  try {
    const { data } = await apiClient.post("/auth/login", credentials);

    if (!data?.success || !data?.data?.token) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return { token: data.data.token };
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.LOGIN_FALLBACK;
    throw new Error(message);
  }
}
