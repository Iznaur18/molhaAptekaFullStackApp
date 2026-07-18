import { apiClient } from "@/shared/api";
import { API_CLIENT_UI, EMAIL_VERIFICATION_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const resendEmailVerification = async (pendingToken: string) => {
  try {
    const { data } = await apiClient.post("/auth/resend-verification", {
      pendingToken,
    });
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    const message = data?.data?.message;
    return typeof message === "string" ? message : EMAIL_VERIFICATION_UI.RESENT;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, EMAIL_VERIFICATION_UI.RESEND_ERROR));
  }
};
