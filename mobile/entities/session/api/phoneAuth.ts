import {
  apiClient,
  isCookieAuthWeb,
  parseAuthSessionData,
  setAuthTokens,
} from "@/shared/api";
import { API_CLIENT_UI, EDIT_PROFILE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

const persistAuthSession = async (data: unknown) => {
  const session = parseAuthSessionData(data);
  if (
    !isCookieAuthWeb() &&
    typeof session.accessToken === "string" &&
    typeof session.refreshToken === "string"
  ) {
    await setAuthTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
  }
  return session;
};

export type PhonePasswordCredentials = {
  phoneNumber: string;
  password: string;
};

export const loginUserByPhonePassword = async (credentials: PhonePasswordCredentials) => {
  try {
    const { data } = await apiClient.post("/auth/login/phone", credentials);
    return persistAuthSession(data);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.LOGIN_FALLBACK));
  }
};

export const requestLoginPhoneOtp = async (payload: { phoneNumber: string }) => {
  try {
    const { data } = await apiClient.post("/auth/login/phone/otp/request", payload);
    if (data?.success !== true) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.LOGIN_FALLBACK));
  }
};

export const confirmLoginPhoneOtp = async (payload: {
  phoneNumber: string;
  code: string;
}) => {
  try {
    const { data } = await apiClient.post("/auth/login/phone/otp/confirm", payload);
    return persistAuthSession(data);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.LOGIN_FALLBACK));
  }
};

export type RegisterPhonePayload = {
  phoneNumber: string;
  password: string;
  passwordConfirm: string;
  userName: string;
  backgroundPresetId?: string;
  userGender?: string;
  notificationsEnabled?: boolean;
  referralCode?: string;
};

export type PendingPhoneRegistration = {
  registrationId: string;
  phoneNumber: string;
};

export const registerUserByPhone = async (
  payload: RegisterPhonePayload,
): Promise<PendingPhoneRegistration> => {
  try {
    const { data } = await apiClient.post("/auth/register/phone", payload);

    if (
      data?.success !== true ||
      data?.data?.pendingRegistration !== true ||
      !data?.data?.registrationId
    ) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      registrationId: String(data.data.registrationId),
      phoneNumber: String(data.data.phoneNumber ?? ""),
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.REGISTER_FALLBACK));
  }
};

export const requestPhoneBind = async (payload: { phoneNumber?: string } = {}) => {
  try {
    const { data } = await apiClient.post("/auth/phone/bind/request", payload);
    if (data?.success !== true) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { phoneNumber?: string; message?: string };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, EDIT_PROFILE_UI.PHONE_VERIFY_REQUEST_ERROR));
  }
};

export const confirmPhoneBind = async (payload: { code: string }) => {
  try {
    const { data } = await apiClient.post("/auth/phone/bind/confirm", payload);
    if (data?.success !== true) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { phoneNumber?: string; message?: string };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, EDIT_PROFILE_UI.PHONE_VERIFY_ERROR));
  }
};
