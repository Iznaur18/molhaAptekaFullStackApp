import { apiClient } from "@/shared/api";
import { EMAIL_VERIFICATION_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

/** Повторная отправка кода по заявке на регистрацию. */
export const resendRegistrationCode = async (registrationId: string) => {
  try {
    const { data } = await apiClient.post("/auth/register/resend", { registrationId });
    return typeof data?.data?.message === "string"
      ? data.data.message
      : EMAIL_VERIFICATION_UI.RESENT;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, EMAIL_VERIFICATION_UI.RESEND_ERROR));
  }
};
