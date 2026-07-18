import {
  apiClient,
  parseAuthSessionData,
  setAuthTokens,
} from "@/shared/api";
import { API_CLIENT_UI, EMAIL_VERIFICATION_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type VerifyEmailWithCodePayload = {
  code: string;
  pendingToken: string;
};

export const verifyEmailWithCode = async ({
  code,
  pendingToken,
}: VerifyEmailWithCodePayload) => {
  try {
    const { data } = await apiClient.post("/auth/verify-email", {
      code,
      pendingToken,
    });
    const session = parseAuthSessionData(data);
    await setAuthTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
    return session;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, EMAIL_VERIFICATION_UI.CONFIRM_ERROR),
    );
  }
};
