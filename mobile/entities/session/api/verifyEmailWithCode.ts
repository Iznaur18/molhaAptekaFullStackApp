import { apiClient } from "@/shared/api";
import { API_CLIENT_UI, EMAIL_VERIFICATION_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const verifyEmailWithCode = async (code: string) => {
  try {
    const { data } = await apiClient.post("/auth/verify-email", { code });
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return typeof data.message === "string" ? data.message : EMAIL_VERIFICATION_UI.VERIFIED_SUCCESS;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, EMAIL_VERIFICATION_UI.CONFIRM_ERROR));
  }
};
