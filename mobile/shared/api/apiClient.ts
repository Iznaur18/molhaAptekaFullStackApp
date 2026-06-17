import {
  createJsonApiClient,
  createRefreshSessionQueue,
  setupAuthSessionInterceptors,
} from "@izibuy/shared-api";

import {
  API_BASE_URL,
  API_CLIENT_UI,
  API_REQUEST_TIMEOUT_MS,
} from "@/shared/config";

import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from "./mobile-auth-storage";
import { parseAuthSessionData } from "./parseApiContract";

export const apiClient = createJsonApiClient({
  baseURL: API_BASE_URL,
  timeoutMs: API_REQUEST_TIMEOUT_MS,
});

const refreshAuthSession = async (): Promise<void> => {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    await clearAuthTokens();
    throw new Error("Refresh token required");
  }

  const { data } = await apiClient.post(
    "/auth/refresh",
    { refreshToken },
    { _skipAuthRefresh: true } as AuthAwareRequestConfig,
  );

  const session = parseAuthSessionData(data);
  await setAuthTokens({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  });
};

const getRefreshSessionOnce = createRefreshSessionQueue(refreshAuthSession);

setupAuthSessionInterceptors(apiClient, {
  getAccessToken,
  refreshSession: getRefreshSessionOnce,
  onRequest: () => {
    if (!API_BASE_URL) {
      throw new Error(API_CLIENT_UI.API_URL_MISSING);
    }
  },
  onRefreshFailure: clearAuthTokens,
});
