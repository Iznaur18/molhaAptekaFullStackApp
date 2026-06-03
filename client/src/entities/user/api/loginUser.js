import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Логин по email + password. JWT ставится сервером в httpOnly cookie.
 *
 * @param {{ email: string; password: string }} credentials
 */
export async function loginUser(credentials) {
  try {
    const { data } = await apiClient.post("/auth/login", credentials);

    if (!data?.success || !data?.data?._id) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.LOGIN_FALLBACK;
    throw new Error(message);
  }
}
