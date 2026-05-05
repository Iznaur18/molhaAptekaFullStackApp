import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Регистрация. Тело — как у `POST /auth/register` (см. валидацию на сервере).
 *
 * @param {import('../model/types.js').RegisterUserPayload} payload
 * @returns {Promise<{ token: string }>}
 */
export async function registerUser(payload) {
  try {
    const { data } = await apiClient.post("/auth/register", payload);

    if (!data?.success || !data?.data?.token) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return { token: data.data.token };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.REGISTER_FALLBACK;
    throw new Error(message);
  }
}
