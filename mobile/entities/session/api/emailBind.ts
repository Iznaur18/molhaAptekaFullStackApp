import { apiClient } from "@/shared/api";
import { API_CLIENT_UI, EDIT_PROFILE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const requestEmailBind = async (payload: { email: string }) => {
  try {
    const { data } = await apiClient.post("/auth/email/bind/request", payload);
    if (data?.success !== true) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { email?: string; message?: string };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, EDIT_PROFILE_UI.EMAIL_VERIFY_REQUEST_ERROR));
  }
};

export const confirmEmailBind = async (payload: { code: string }) => {
  try {
    const { data } = await apiClient.post("/auth/email/bind/confirm", payload);
    if (data?.success !== true) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { email?: string; message?: string };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, EDIT_PROFILE_UI.EMAIL_VERIFY_ERROR));
  }
};
