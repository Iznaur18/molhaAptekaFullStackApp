import axios from "axios";

import { API_BASE_URL } from "../config/apiBaseUrl.js";

export const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/** Удаляет legacy JWT из localStorage после перехода на httpOnly cookie. */
export const clearLegacyAuthTokenStorage = () => {
  try {
    localStorage.removeItem("rassro_auth_token");
  } catch {
    // storage недоступен
  }
};

clearLegacyAuthTokenStorage();

let refreshSessionPromise = null;

const shouldSkipAuthRefresh = (url) => {
  const path = String(url ?? "");
  return (
    path.includes("/auth/refresh") ||
    path.includes("/auth/login") ||
    path.includes("/auth/register") ||
    path.includes("/auth/logout")
  );
};

const refreshAuthSession = () => {
  if (!refreshSessionPromise) {
    refreshSessionPromise = apiClient.post("/auth/refresh").finally(() => {
      refreshSessionPromise = null;
    });
  }
  return refreshSessionPromise;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._authRefreshAttempted ||
      shouldSkipAuthRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._authRefreshAttempted = true;

    try {
      await refreshAuthSession();
      return apiClient(originalRequest);
    } catch {
      return Promise.reject(error);
    }
  },
);
