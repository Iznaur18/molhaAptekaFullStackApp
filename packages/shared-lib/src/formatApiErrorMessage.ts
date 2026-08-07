type ApiErrorBody = {
  message?: string;
};

type AxiosLikeError = {
  code?: string;
  message?: string;
  response?: {
    status?: number;
    data?: ApiErrorBody;
  };
};

const NETWORK_ERROR = "Нет подключения к интернету";
const TIMEOUT_ERROR = "Превышено время ожидания ответа";
const BAD_REQUEST = "Некорректный запрос";
const UNAUTHORIZED = "Нужно войти в аккаунт";
const FORBIDDEN = "Недостаточно прав";
const NOT_FOUND = "Не найдено";
const CONFLICT = "Конфликт данных. Обновите и попробуйте снова";
const TOO_MANY = "Слишком много запросов. Подождите немного";
const SERVER_UNAVAILABLE = "Сервер временно недоступен. Попробуйте позже";

const AXIOS_STATUS_MESSAGE_RE = /^Request failed with status code (\d+)\s*$/i;

const STATUS_MESSAGES: Record<number, string> = {
  400: BAD_REQUEST,
  401: UNAUTHORIZED,
  403: FORBIDDEN,
  404: NOT_FOUND,
  408: TIMEOUT_ERROR,
  409: CONFLICT,
  422: BAD_REQUEST,
  429: TOO_MANY,
};

const isAxiosLikeError = (error: unknown): error is AxiosLikeError => {
  return typeof error === "object" && error !== null;
};

const messageForStatus = (status: number): string | undefined => {
  if (STATUS_MESSAGES[status]) {
    return STATUS_MESSAGES[status];
  }
  if (status >= 500 && status < 600) {
    return SERVER_UNAVAILABLE;
  }
  return undefined;
};

const parseAxiosStatusMessage = (message: string): number | undefined => {
  const match = AXIOS_STATUS_MESSAGE_RE.exec(message.trim());
  if (!match) {
    return undefined;
  }
  const status = Number(match[1]);
  return Number.isFinite(status) ? status : undefined;
};

const isTechnicalAxiosMessage = (message: string): boolean => {
  const trimmed = message.trim();
  if (!trimmed) {
    return true;
  }
  if (AXIOS_STATUS_MESSAGE_RE.test(trimmed)) {
    return true;
  }
  const lower = trimmed.toLowerCase();
  return lower === "network error" || lower === "timeout of 0ms exceeded";
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

    const bodyMessage = error.response?.data?.message;
    if (typeof bodyMessage === "string" && bodyMessage.trim()) {
      return bodyMessage.trim();
    }

    const responseStatus = error.response?.status;
    if (typeof responseStatus === "number") {
      const fromStatus = messageForStatus(responseStatus);
      if (fromStatus) {
        return fromStatus;
      }
    }

    if (typeof error.message === "string" && error.message.trim()) {
      const parsedStatus = parseAxiosStatusMessage(error.message);
      if (parsedStatus !== undefined) {
        return messageForStatus(parsedStatus) ?? fallback;
      }
      if (!isTechnicalAxiosMessage(error.message)) {
        return error.message.trim();
      }
    }
  }

  if (error instanceof Error && error.message.trim()) {
    const parsedStatus = parseAxiosStatusMessage(error.message);
    if (parsedStatus !== undefined) {
      return messageForStatus(parsedStatus) ?? fallback;
    }
    if (!isTechnicalAxiosMessage(error.message)) {
      return error.message.trim();
    }
  }

  return fallback;
};
