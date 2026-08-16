import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  authMeDataSchema,
  authSessionDataSchema,
  catalogProductsPageDataSchema,
  createOrderDataSchema,
  parseApiSuccess,
  productWriteDataSchema,
  replaceCartDataSchema,
  userSellerProductsPageDataSchema,
} from "@molha/api-contract";
import type { z } from "zod";

import {
  generateClientRequestId,
  getRequestIdFromAxiosError,
  REQUEST_ID_HEADER,
} from "./requestId.js";

export {
  generateClientRequestId,
  getRequestIdFromAxiosError,
  isCorrelationWorthyApiFailure,
  normalizeClientRequestId,
  readHeaderIgnoreCase,
  REQUEST_ID_HEADER,
  REQUEST_ID_MAX_LENGTH,
  REQUEST_ID_MIN_LENGTH,
} from "./requestId.js";

const AUTH_REFRESH_SKIP_PATHS = [
  "/auth/refresh",
  "/auth/login",
  "/auth/register",
  "/auth/logout",
  "/auth/password/reset",
];

export const toContractClientError = (
  error: unknown,
  invalidServerResponseMessage: string,
): Error => {
  if (error instanceof Error && error.message === "INVALID_API_ENVELOPE") {
    return new Error(invalidServerResponseMessage);
  }
  if (error instanceof Error && error.message === "INVALID_API_DATA") {
    return new Error(invalidServerResponseMessage);
  }
  return error instanceof Error ? error : new Error(String(error));
};

export const parseApiContractData = <T extends z.ZodTypeAny>(
  payload: unknown,
  dataSchema: T,
  invalidServerResponseMessage: string,
): z.infer<T> => {
  try {
    return parseApiSuccess(payload, dataSchema);
  } catch (error) {
    throw toContractClientError(error, invalidServerResponseMessage);
  }
};

export const parseAuthMeData = (
  payload: unknown,
  invalidServerResponseMessage: string,
) => parseApiContractData(payload, authMeDataSchema, invalidServerResponseMessage);

export const parseAuthSessionData = (
  payload: unknown,
  invalidServerResponseMessage: string,
) => parseApiContractData(payload, authSessionDataSchema, invalidServerResponseMessage);

export const parseCatalogProductsPageData = (
  payload: unknown,
  invalidServerResponseMessage: string,
) => parseApiContractData(payload, catalogProductsPageDataSchema, invalidServerResponseMessage);

export const parseReplaceCartData = (
  payload: unknown,
  invalidServerResponseMessage: string,
) => parseApiContractData(payload, replaceCartDataSchema, invalidServerResponseMessage);

export const parseCreateOrderData = (
  payload: unknown,
  invalidServerResponseMessage: string,
) => parseApiContractData(payload, createOrderDataSchema, invalidServerResponseMessage);

export const parseCreateProductData = (
  payload: unknown,
  invalidServerResponseMessage: string,
) => parseApiContractData(payload, productWriteDataSchema, invalidServerResponseMessage);

export const parsePatchMyProductData = (
  payload: unknown,
  invalidServerResponseMessage: string,
) => parseApiContractData(payload, productWriteDataSchema, invalidServerResponseMessage);

export const parseUserSellerProductsPageData = (
  payload: unknown,
  invalidServerResponseMessage: string,
) =>
  parseApiContractData(
    payload,
    userSellerProductsPageDataSchema,
    invalidServerResponseMessage,
  );

export const shouldSkipAuthRefreshByUrl = (url?: string): boolean => {
  const path = String(url ?? "");
  return AUTH_REFRESH_SKIP_PATHS.some((skipPath) => path.includes(skipPath));
};

export { isDefinitiveAuthRefreshFailure } from "./isDefinitiveAuthRefreshFailure.js";

export const createRefreshSessionQueue = <T>(refreshFn: () => Promise<T>) => {
  let refreshSessionPromise: Promise<T> | null = null;

  return () => {
    if (!refreshSessionPromise) {
      refreshSessionPromise = refreshFn().finally(() => {
        refreshSessionPromise = null;
      });
    }
    return refreshSessionPromise;
  };
};

export type AuthAwareRequestConfig = InternalAxiosRequestConfig & {
  _authRefreshAttempted?: boolean;
  _skipAuthRefresh?: boolean;
  _requestId?: string;
};

type SetupAuthSessionInterceptorsOptions = {
  shouldAttachAccessToken?: () => boolean;
  getAccessToken: () => string | null | Promise<string | null>;
  refreshSession: () => Promise<unknown>;
  shouldSkipRefreshOnError?: (error: AxiosError) => boolean;
  shouldSkipByRequestConfig?: (config: AuthAwareRequestConfig) => boolean;
  onRequest?: (config: InternalAxiosRequestConfig) => void | Promise<void>;
  onAuthSuccessResponse?: (response: AxiosResponse) => void | Promise<void>;
  shouldHandleAuthSuccessResponse?: (path: string) => boolean;
  onRefreshFailure?: (refreshError?: unknown) => void | Promise<void>;
};

const attachOutboundRequestId = (config: InternalAxiosRequestConfig) => {
  const typed = config as AuthAwareRequestConfig;
  const existingHeader =
    typeof config.headers?.get === "function"
      ? config.headers.get(REQUEST_ID_HEADER)
      : null;
  const existing =
    typed._requestId ||
    (typeof existingHeader === "string" ? existingHeader : null) ||
    (typeof config.headers === "object" && config.headers
      ? (config.headers as Record<string, unknown>)[REQUEST_ID_HEADER]
      : null);

  const requestId =
    (typeof existing === "string" && existing.trim()) || generateClientRequestId();

  typed._requestId = requestId;
  if (config.headers && typeof config.headers.set === "function") {
    config.headers.set(REQUEST_ID_HEADER, requestId);
  } else {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>)[REQUEST_ID_HEADER] = requestId;
  }
};

export const createJsonApiClient = (options: {
  baseURL?: string;
  timeoutMs?: number;
  withCredentials?: boolean;
}): AxiosInstance => {
  const { baseURL, timeoutMs, withCredentials } = options;

  const apiClient = axios.create({
    baseURL: baseURL || undefined,
    headers: {
      "Content-Type": "application/json",
    },
    ...(typeof timeoutMs === "number" ? { timeout: timeoutMs } : {}),
    ...(withCredentials ? { withCredentials: true } : {}),
  });

  apiClient.interceptors.request.use((config) => {
    attachOutboundRequestId(config);
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError & { requestId?: string }) => {
      const requestId = getRequestIdFromAxiosError(error);
      if (requestId) {
        error.requestId = requestId;
      }
      return Promise.reject(error);
    },
  );

  return apiClient;
};

export const setupAuthSessionInterceptors = (
  apiClient: AxiosInstance,
  options: SetupAuthSessionInterceptorsOptions,
) => {
  const {
    shouldAttachAccessToken = () => true,
    getAccessToken,
    refreshSession,
    shouldSkipRefreshOnError,
    shouldSkipByRequestConfig,
    onRequest,
    onAuthSuccessResponse,
    shouldHandleAuthSuccessResponse,
    onRefreshFailure,
  } = options;

  apiClient.interceptors.request.use(async (config) => {
    if (onRequest) {
      await onRequest(config);
    }

    if (!shouldAttachAccessToken()) {
      return config;
    }

    const accessToken = await getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  });

  apiClient.interceptors.response.use(
    async (response) => {
      if (onAuthSuccessResponse && shouldHandleAuthSuccessResponse) {
        const path = String(response.config?.url ?? "");
        if (shouldHandleAuthSuccessResponse(path)) {
          await onAuthSuccessResponse(response);
        }
      }
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AuthAwareRequestConfig | undefined;

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._authRefreshAttempted ||
        originalRequest._skipAuthRefresh ||
        shouldSkipAuthRefreshByUrl(originalRequest.url) ||
        (shouldSkipByRequestConfig?.(originalRequest) ?? false) ||
        (shouldSkipRefreshOnError?.(error) ?? false)
      ) {
        return Promise.reject(error);
      }

      originalRequest._authRefreshAttempted = true;

      try {
        await refreshSession();
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (onRefreshFailure) {
          await onRefreshFailure(refreshError);
        }
        // Prefer refresh error so callers don't treat a transient refresh failure
        // as a definitive 401 from the original request (which would false-logout).
        return Promise.reject(refreshError);
      }
    },
  );
};

export const postMultipart = async <TResponse = unknown>(
  apiClient: AxiosInstance,
  url: string,
  formData: FormData,
  requestConfig?: AxiosRequestConfig,
): Promise<TResponse> => {
  const { data } = await apiClient.post<TResponse>(url, formData, {
    ...requestConfig,
    transformRequest: (payload, headers) => {
      if (headers && typeof headers === "object") {
        // For multipart browser/runtime must set boundary itself.
        delete headers["Content-Type"];
      }
      if (typeof requestConfig?.transformRequest === "function") {
        return (requestConfig.transformRequest as (data: unknown, headers: unknown) => unknown)(payload, headers);
      }
      return payload;
    },
  });
  return data;
};
