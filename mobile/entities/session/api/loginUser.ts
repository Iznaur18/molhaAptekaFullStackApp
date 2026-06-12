import {
  apiClient,
  parseAuthSessionData,
  setAuthTokens,
} from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type LoginCredentials = {
  email: string;
  password: string;
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
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.LOGIN_FALLBACK));
  }
};
