import {
  apiClient,
  parseAuthSessionData,
  setAuthTokens,
} from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type RegisterPayload = {
  email: string;
  password: string;
  passwordConfirm: string;
  userName: string;
  backgroundPresetId?: string;
  userGender?: string;
  notificationsEnabled?: boolean;
};

export const registerUser = async (payload: RegisterPayload) => {
  try {
    const { data } = await apiClient.post("/auth/register", payload);
    const session = parseAuthSessionData(data);
    await setAuthTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
    return session;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.REGISTER_FALLBACK));
  }
};
