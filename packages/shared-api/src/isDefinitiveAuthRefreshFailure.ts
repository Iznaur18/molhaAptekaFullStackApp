import type { AxiosError } from "axios";

/**
 * Refresh failed for a reason that means the session is actually dead
 * (invalid/missing/revoked token, blocked user). Network and 5xx are NOT definitive —
 * keep cookies / stored tokens and retry later.
 */
export const isDefinitiveAuthRefreshFailure = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const axiosLike = error as AxiosError;
  const status = axiosLike.response?.status;
  if (typeof status !== "number") {
    return false;
  }
  if (status >= 500 && status < 600) {
    return false;
  }
  if (status === 401 || status === 403) {
    return true;
  }
  // Other 4xx from /auth/refresh (malformed body, etc.) — treat as dead session.
  return status >= 400 && status < 500;
};
