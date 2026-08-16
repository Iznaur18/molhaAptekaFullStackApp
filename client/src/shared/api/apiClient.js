import {
  createJsonApiClient,
  createRefreshSessionQueue,
  getRequestIdFromAxiosError,
  isCorrelationWorthyApiFailure,
  isDefinitiveAuthRefreshFailure,
  setupAuthSessionInterceptors,
} from "@izibuy/shared-api";

import { API_BASE_URL } from "../config/apiBaseUrl.js";
import { isClientSentryEnabled } from "../lib/clientSentryEnv.js";
import { applyDevAuthTokensFromResponse } from "./applyDevAuthTokensFromResponse.js";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  isBearerAuthEnabled,
} from "./web-auth-storage.js";
import { emitAuthSessionDead } from "../lib/authSessionEvents.js";

export const apiClient = createJsonApiClient({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/** В Vite DEV сервер отдаёт JWT в JSON при `X-Auth-Client: web-dev` (см. LAN-dev-access.md). */
if (import.meta.env.DEV) {
  apiClient.defaults.headers.common["X-Auth-Client"] = "web-dev";
}
/** Удаляет legacy JWT из localStorage после перехода на httpOnly cookie. */
export const clearLegacyAuthTokenStorage = () => {
  try {
    localStorage.removeItem("rassro_auth_token");
  } catch {
    // storage недоступен
  }
};

clearLegacyAuthTokenStorage();

let authSessionDead = false;

export const resetAuthSessionState = () => {
  authSessionDead = false;
};

export const markAuthSessionDead = () => {
  authSessionDead = true;
};

/** Сбрасывает битые httpOnly cookie после неудачного refresh. */
export const clearDeadAuthSession = async () => {
  markAuthSessionDead();
  clearAuthTokens();
  emitAuthSessionDead();
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // гость или сеть
  }
};

const isMissingAuthTokenError = (error) => {
  const message = error?.response?.data?.message;
  return (
    typeof message === "string" &&
    (message.includes("токен не найден") || message.includes("Refresh token required"))
  );
};

const refreshAuthSession = createRefreshSessionQueue(async () => {
  const refreshToken = getRefreshToken();
  const refreshBody = refreshToken ? { refreshToken } : undefined;

  try {
    const response = await apiClient.post("/auth/refresh", refreshBody);
    applyDevAuthTokensFromResponse(response);
    resetAuthSessionState();
  } catch (error) {
    // Сеть / 5xx — не гасим cookie; следующий запрос снова попробует refresh.
    if (isDefinitiveAuthRefreshFailure(error) || isMissingAuthTokenError(error)) {
      await clearDeadAuthSession();
    }
    throw error;
  }
});

setupAuthSessionInterceptors(apiClient, {
  shouldAttachAccessToken: isBearerAuthEnabled,
  getAccessToken,
  refreshSession: refreshAuthSession,
  shouldSkipByRequestConfig: () => authSessionDead,
  shouldSkipRefreshOnError: isMissingAuthTokenError,
  onRequest: (config) => {
    if (config.data instanceof FormData) {
      config.headers.delete("Content-Type");
    }
  },
  onAuthSuccessResponse: applyDevAuthTokensFromResponse,
  shouldHandleAuthSuccessResponse: (path) =>
    path.includes("/auth/login") ||
    path.includes("/auth/register") ||
    path.includes("/auth/refresh") ||
    path.includes("/auth/password/change"),
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestId = getRequestIdFromAxiosError(error);
    const status = error?.response?.status;
    const url = String(error?.config?.url ?? "");
    if (
      requestId &&
      isClientSentryEnabled() &&
      isCorrelationWorthyApiFailure(url, status)
    ) {
      void import("../lib/sentryClient.js").then((Sentry) => {
        Sentry.addBreadcrumb({
          category: "api",
          message: `API ${status ?? "network"} ${url || "request"}`,
          level: typeof status === "number" && status >= 500 ? "error" : "warning",
          data: { requestId, status: status ?? null, url: url || null },
        });
      });
    }
    return Promise.reject(error);
  },
);
