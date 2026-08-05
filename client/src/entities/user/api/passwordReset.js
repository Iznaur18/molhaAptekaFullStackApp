import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

/**
 * @param {{ email?: string; phoneNumber?: string }} payload
 */
export async function requestPasswordReset(payload) {
  try {
    const { data } = await apiClient.post("/auth/password/reset/request", payload);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, "Не удалось отправить код"));
  }
}

/**
 * @param {{
 *   email?: string;
 *   phoneNumber?: string;
 *   code: string;
 *   newPassword: string;
 *   newPasswordConfirm: string;
 * }} payload
 */
export async function confirmPasswordReset(payload) {
  try {
    const { data } = await apiClient.post("/auth/password/reset/confirm", payload);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, "Не удалось сбросить пароль"));
  }
}

/**
 * @param {{
 *   currentPassword: string;
 *   newPassword: string;
 *   newPasswordConfirm: string;
 * }} payload
 */
export async function changePassword(payload) {
  try {
    const { data } = await apiClient.post("/auth/password/change", payload);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, "Не удалось сменить пароль"));
  }
}
