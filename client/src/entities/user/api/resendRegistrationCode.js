import { apiClient } from "../../../shared/api/index.js";
import { EMAIL_VERIFICATION_UI } from "../../../shared/config/appUiCopy.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

/**
 * Повторная отправка кода по заявке на регистрацию.
 *
 * @param {{ registrationId: string }} params
 * @returns {Promise<string>} сообщение для пользователя
 */
export async function resendRegistrationCode({ registrationId }) {
  try {
    const { data } = await apiClient.post("/auth/register/resend", { registrationId });
    return typeof data?.data?.message === "string" ? data.data.message : "";
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, EMAIL_VERIFICATION_UI.RESEND_ERROR));
  }
}
