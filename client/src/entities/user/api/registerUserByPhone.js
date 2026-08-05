import { apiClient } from "../../../shared/api/index.js";
import { resetAuthSessionState } from "../../../shared/api/apiClient.js";
import { clearDevAuthTokens } from "../../../shared/api/devAuthTokenStorage.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

/**
 * @param {Record<string, unknown>} payload
 * @returns {Promise<{ registrationId: string; phoneNumber: string }>}
 */
export async function registerUserByPhone(payload) {
  try {
    resetAuthSessionState();
    clearDevAuthTokens();
    await apiClient.post("/auth/logout").catch(() => {});

    const { data } = await apiClient.post("/auth/register/phone", payload);

    if (
      !data?.success ||
      data?.data?.pendingRegistration !== true ||
      !data?.data?.registrationId
    ) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      registrationId: String(data.data.registrationId),
      phoneNumber: String(data.data.phoneNumber ?? ""),
    };
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, API_CLIENT_UI.REGISTER_FALLBACK));
  }
}

/**
 * @param {{ phoneNumber?: string }} payload
 */
export async function requestPhoneBind(payload = {}) {
  try {
    const { data } = await apiClient.post("/auth/phone/bind/request", payload);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, "Не удалось отправить SMS"));
  }
}

/**
 * @param {{ code: string }} payload
 */
export async function confirmPhoneBind(payload) {
  try {
    const { data } = await apiClient.post("/auth/phone/bind/confirm", payload);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, "Не удалось подтвердить телефон"));
  }
}
