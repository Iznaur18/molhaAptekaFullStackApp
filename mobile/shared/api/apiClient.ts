import {
  createJsonApiClient,
  createRefreshSessionQueue,
  getRequestIdFromAxiosError,
  isCorrelationWorthyApiFailure,
  isDefinitiveAuthRefreshFailure,
  setupAuthSessionInterceptors,
  type AuthAwareRequestConfig,
} from "@izibuy/shared-api";
import { Platform } from "react-native";

import {
  API_BASE_URL,
  API_CLIENT_UI,
  API_REQUEST_TIMEOUT_MS,
} from "@/shared/config";
import { isMobileSentryEnabled, Sentry } from "@/shared/lib/initMobileSentry";

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
  onRefreshFailure: async (refreshError) => {
    // Сеть / 5xx — не чистим SecureStore; иначе ложный logout после краткого сбоя API.
    if (isDefinitiveAuthRefreshFailure(refreshError)) {
      await clearAuthTokens();
    }
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestId = getRequestIdFromAxiosError(error);
    const status =
      error && typeof error === "object" && "response" in error
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;
    const url =
      error && typeof error === "object" && "config" in error
        ? String((error as { config?: { url?: string } }).config?.url ?? "")
        : "";

    if (
      requestId &&
      isMobileSentryEnabled() &&
      isCorrelationWorthyApiFailure(url, status) &&
      typeof Sentry.addBreadcrumb === "function"
    ) {
      Sentry.addBreadcrumb({
        category: "api",
        message: `API ${status ?? "network"} ${url || "request"}`,
        level: typeof status === "number" && status >= 500 ? "error" : "warning",
        data: { requestId, status: status ?? null, url: url || null },
      });
    }

    return Promise.reject(error);
  },
);
