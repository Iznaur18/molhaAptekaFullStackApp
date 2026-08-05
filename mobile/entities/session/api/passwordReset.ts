import {
  apiClient,
  isCookieAuthWeb,
  parseAuthSessionData,
  setAuthTokens,
} from "@/shared/api";
import { API_CLIENT_UI, AUTH_UI, EDIT_PROFILE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type PasswordResetRequestPayload =
  | { email: string; phoneNumber?: never }
  | { phoneNumber: string; email?: never };

export type PasswordResetConfirmPayload = PasswordResetRequestPayload & {
  code: string;
  newPassword: string;
  newPasswordConfirm: string;
};

export type PasswordChangePayload = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

export const requestPasswordReset = async (payload: PasswordResetRequestPayload) => {
  try {
    const { data } = await apiClient.post("/auth/password/reset/request", payload);
    if (data?.success !== true) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { message?: string };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, AUTH_UI.FORGOT_SEND_ERROR));
  }
};

export const confirmPasswordReset = async (payload: PasswordResetConfirmPayload) => {
  try {
    const { data } = await apiClient.post("/auth/password/reset/confirm", payload);
    if (data?.success !== true) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { message?: string };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, AUTH_UI.FORGOT_CONFIRM_ERROR));
  }
};

export const changePassword = async (payload: PasswordChangePayload) => {
  try {
    const { data } = await apiClient.post("/auth/password/change", payload);
    if (data?.success !== true) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    const message =
      typeof data?.data?.message === "string" ? data.data.message : undefined;
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
    return { ...session, message };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, EDIT_PROFILE_UI.PASSWORD_CHANGE_ERROR));
  }
};
