import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

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
} from "./authTokenStorage";
import { parseAuthSessionData } from "./parseApiContract";

type AuthAwareRequestConfig = InternalAxiosRequestConfig & {
  _authRefreshAttempted?: boolean;
  _skipAuthRefresh?: boolean;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: API_REQUEST_TIMEOUT_MS,
});

let refreshSessionPromise: Promise<void> | null = null;

const shouldSkipAuthRefresh = (url?: string) => {
  const path = String(url ?? "");
  return (
    path.includes("/auth/refresh") ||
    path.includes("/auth/login") ||
    path.includes("/auth/register") ||
    path.includes("/auth/logout")
  );
};

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

const getRefreshSessionOnce = () => {
  if (!refreshSessionPromise) {
    refreshSessionPromise = refreshAuthSession().finally(() => {
      refreshSessionPromise = null;
    });
  }
  return refreshSessionPromise;
};

apiClient.interceptors.request.use(async (config) => {
  if (!API_BASE_URL) {
    return Promise.reject(new Error(API_CLIENT_UI.API_URL_MISSING));
  }

  const accessToken = await getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AuthAwareRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._authRefreshAttempted ||
      originalRequest._skipAuthRefresh ||
      shouldSkipAuthRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._authRefreshAttempted = true;

    try {
      await getRefreshSessionOnce();
      return apiClient(originalRequest);
    } catch {
      await clearAuthTokens();
      return Promise.reject(error);
    }
  },
);
