import { apiClient } from "../../../shared/api/index.js";
import { resetAuthSessionState } from "../../../shared/api/apiClient.js";
import { clearDevAuthTokens } from "../../../shared/api/devAuthTokenStorage.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

/**
 * @param {{ phoneNumber: string; password: string }} credentials
 */
export async function loginUserByPhonePassword(credentials) {
  try {
    resetAuthSessionState();
    clearDevAuthTokens();
    await apiClient.post("/auth/logout").catch(() => {});

    const { data } = await apiClient.post("/auth/login/phone", credentials);

    if (!data?.success || !data?.data?._id) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, API_CLIENT_UI.LOGIN_FALLBACK));
  }
}

/**
 * @param {{ phoneNumber: string }} payload
 */
export async function requestLoginPhoneOtp(payload) {
  try {
    const { data } = await apiClient.post("/auth/login/phone/otp/request", payload);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, API_CLIENT_UI.LOGIN_FALLBACK));
  }
}

/**
 * @param {{ phoneNumber: string; code: string }} payload
 */
export async function confirmLoginPhoneOtp(payload) {
  try {
    resetAuthSessionState();
    clearDevAuthTokens();
    await apiClient.post("/auth/logout").catch(() => {});

    const { data } = await apiClient.post("/auth/login/phone/otp/confirm", payload);

    if (!data?.success || !data?.data?._id) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, API_CLIENT_UI.LOGIN_FALLBACK));
  }
}
