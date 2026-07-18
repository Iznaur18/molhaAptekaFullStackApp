import {
  apiClient,
  parseAuthSessionData,
  setAuthTokens,
} from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import { NeedsEmailVerificationError } from "../lib/NeedsEmailVerificationError";

export type LoginCredentials = {
  email: string;
  password: string;
};

const readNeedsEmailVerification = (error: unknown) => {
  if (typeof error !== "object" || error === null) {
    return null;
  }
  const response = "response" in error ? error.response : null;
  if (typeof response !== "object" || response === null) {
    return null;
  }
  const data = "data" in response ? response.data : null;
  if (typeof data !== "object" || data === null) {
    return null;
  }
  const record = data as Record<string, unknown>;
  if (
    record.needsEmailVerification === true &&
    typeof record.pendingToken === "string" &&
    typeof record.email === "string"
  ) {
    return {
      message:
        typeof record.message === "string"
          ? record.message
          : API_CLIENT_UI.LOGIN_FALLBACK,
      pendingToken: record.pendingToken,
      email: record.email,
    };
  }
  return null;
};

export const loginUser = async (credentials: LoginCredentials) => {
  try {
    const { data } = await apiClient.post("/auth/login", credentials);
    const session = parseAuthSessionData(data);
    await setAuthTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
    return session;
  } catch (error) {
    const needsVerification = readNeedsEmailVerification(error);
    if (needsVerification) {
      throw new NeedsEmailVerificationError(needsVerification);
    }
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.LOGIN_FALLBACK));
  }
};
