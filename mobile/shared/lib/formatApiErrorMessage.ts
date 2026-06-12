import { AxiosError } from "axios";

import { API_CLIENT_UI } from "@/shared/config";

type ApiErrorBody = {
  message?: string;
};

export const formatApiErrorMessage = (
  error: unknown,
  fallback = "Произошла ошибка",
): string => {
  if (error instanceof AxiosError) {
    if (error.code === "ERR_NETWORK") {
      return API_CLIENT_UI.NETWORK_ERROR;
    }
    if (error.code === "ECONNABORTED") {
      return API_CLIENT_UI.TIMEOUT_ERROR;
    }
    const message = (error.response?.data as ApiErrorBody | undefined)?.message;
    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
};
