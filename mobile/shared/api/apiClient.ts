import {
  createJsonApiClient,
  createRefreshSessionQueue,
  setupAuthSessionInterceptors,
  type AuthAwareRequestConfig,
} from "@izibuy/shared-api";
import { Platform } from "react-native";

import {
  API_BASE_URL,
  API_CLIENT_UI,
  API_REQUEST_TIMEOUT_MS,
} from "@/shared/config";

import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  isCookieAuthWeb,
  setAuthTokens,
} from "./mobile-auth-storage";
import { parseAuthSessionData } from "./parseApiContract";

export const apiClient = createJsonApiClient({
  baseURL: API_BASE_URL,
  timeoutMs: API_REQUEST_TIMEOUT_MS,
  withCredentials: true,
});

const refreshAuthSession = async (): Promise<void> => {
  if (isCookieAuthWeb()) {
    await apiClient.post("/auth/refresh", undefined, {
      _skipAuthRefresh: true,
    } as AuthAwareRequestConfig);
    return;
  }

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
  shouldAttachAccessToken: () => !isCookieAuthWeb(),
  getAccessToken,
  refreshSession: getRefreshSessionOnce,
  onRequest: (config) => {
    if (!API_BASE_URL) {
      throw new Error(API_CLIENT_UI.API_URL_MISSING);
    }
    config.headers = config.headers ?? {};
    // Native: Bearer в JSON. Web: httpOnly cookies (без X-Auth-Client: mobile).
    if (Platform.OS !== "web") {
      config.headers["X-Auth-Client"] = "mobile";
    }
  },
  onRefreshFailure: clearAuthTokens,
});
