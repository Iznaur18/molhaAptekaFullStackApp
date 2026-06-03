import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Регистрация. JWT ставится сервером в httpOnly cookie.
 *
 * @param {import('../model/types.js').RegisterUserPayload} payload
 */
export async function registerUser(payload) {
  try {
    const { data } = await apiClient.post("/auth/register", payload);

    if (!data?.success || !data?.data?._id) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.REGISTER_FALLBACK;
    throw new Error(message);
  }
}
