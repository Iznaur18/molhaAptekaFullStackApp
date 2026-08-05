import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

/**
 * @param {{ email: string }} payload
 */
export async function requestEmailBind(payload) {
  try {
    const { data } = await apiClient.post("/auth/email/bind/request", payload);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, "Не удалось отправить письмо"));
  }
}

/**
 * @param {{ code: string }} payload
 */
export async function confirmEmailBind(payload) {
  try {
    const { data } = await apiClient.post("/auth/email/bind/confirm", payload);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, "Не удалось подтвердить email"));
  }
}
