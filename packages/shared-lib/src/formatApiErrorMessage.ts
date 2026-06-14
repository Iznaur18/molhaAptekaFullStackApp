type ApiErrorBody = {
  message?: string;
};

const NETWORK_ERROR = "Нет подключения к интернету";
const TIMEOUT_ERROR = "Превышено время ожидания ответа";

const isAxiosLikeError = (
  error: unknown,
): error is { code?: string; response?: { data?: ApiErrorBody }; message?: string } => {
  return typeof error === "object" && error !== null;
};

export const formatApiErrorMessage = (
  error: unknown,
  fallback = "Произошла ошибка",
): string => {
  if (isAxiosLikeError(error)) {
    if (error.code === "ERR_NETWORK") {
      return NETWORK_ERROR;
    }
    if (error.code === "ECONNABORTED") {
      return TIMEOUT_ERROR;
    }
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
    if (typeof error.message === "string" && error.message.trim()) {
      return error.message.trim();
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
};
