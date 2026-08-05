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
  onRefreshFailure?: () => void | Promise<void>;
};

export const createJsonApiClient = (options: {
  baseURL?: string;
  timeoutMs?: number;
  withCredentials?: boolean;
}): AxiosInstance => {
  const { baseURL, timeoutMs, withCredentials } = options;

  return axios.create({
    baseURL: baseURL || undefined,
    headers: {
      "Content-Type": "application/json",
    },
    ...(typeof timeoutMs === "number" ? { timeout: timeoutMs } : {}),
    ...(withCredentials ? { withCredentials: true } : {}),
  });
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
      } catch {
        if (onRefreshFailure) {
          await onRefreshFailure();
        }
        return Promise.reject(error);
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
