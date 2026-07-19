import { apiClient, parseAuthSessionData, setAuthTokens } from "@/shared/api";
import { EMAIL_VERIFICATION_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type ConfirmRegistrationParams = {
  registrationId: string;
  code: string;
};

/**
 * Завершение регистрации: сервер проверяет код, создаёт аккаунт
 * (isEmailVerified: true) и выдаёт сессию.
 */
export const confirmRegistration = async ({
  registrationId,
  code,
}: ConfirmRegistrationParams) => {
  try {
    const { data } = await apiClient.post("/auth/register/confirm", {
      registrationId,
      code,
    });
    const session = parseAuthSessionData(data);
    await setAuthTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
    return session;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, EMAIL_VERIFICATION_UI.CONFIRM_ERROR));
  }
};
