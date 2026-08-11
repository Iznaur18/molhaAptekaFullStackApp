type ApiErrorBody = {
  message?: string;
};

type AxiosLikeError = {
  code?: string;
  message?: string;
  name?: string;
  issues?: unknown;
  response?: {
    status?: number;
    data?: ApiErrorBody;
  };
};

type ZodIssueLike = {
  message?: unknown;
  code?: unknown;
  path?: unknown;
};

const NETWORK_ERROR = "Нет подключения к интернету";
const TIMEOUT_ERROR = "Превышено время ожидания ответа";
const BAD_REQUEST = "Проверьте заполненные поля и попробуйте снова";
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

const readZodIssueMessage = (issue: unknown): string | undefined => {
  if (!issue || typeof issue !== "object") {
    return undefined;
  }
  const candidate = issue as ZodIssueLike;
  if (typeof candidate.message !== "string" || !candidate.message.trim()) {
    return undefined;
  }
  const looksLikeZodIssue =
    "code" in candidate || "path" in candidate || "minimum" in candidate;
  if (!looksLikeZodIssue) {
    return undefined;
  }
  return candidate.message.trim();
};

/**
 * ZodError.message is a JSON-serialized issues array — never show it raw in UI.
 */
export const extractZodIssueUserMessage = (raw: unknown): string | undefined => {
  if (Array.isArray(raw)) {
    return readZodIssueMessage(raw[0]);
  }

  if (typeof raw !== "string") {
    return undefined;
  }

  const trimmed = raw.trim();
  if (!trimmed.startsWith("[")) {
    return undefined;
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) {
      return undefined;
    }
    return readZodIssueMessage(parsed[0]);
  } catch {
    return undefined;
  }
};

const messageFromZodLikeError = (error: AxiosLikeError): string | undefined => {
  if (Array.isArray(error.issues)) {
    const fromIssues = readZodIssueMessage(error.issues[0]);
    if (fromIssues) {
      return fromIssues;
    }
  }

  if (typeof error.message === "string") {
    return extractZodIssueUserMessage(error.message);
  }

  return undefined;
};

const sanitizeUserMessage = (message: string): string | undefined => {
  const trimmed = message.trim();
  if (!trimmed) {
    return undefined;
  }

  const fromZodJson = extractZodIssueUserMessage(trimmed);
  if (fromZodJson) {
    return fromZodJson;
  }

  if (isTechnicalAxiosMessage(trimmed)) {
    return undefined;
  }

  return trimmed;
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

    const fromZod = messageFromZodLikeError(error);
    if (fromZod) {
      return fromZod;
    }

    const bodyMessage = error.response?.data?.message;
    if (typeof bodyMessage === "string") {
      const sanitizedBody = sanitizeUserMessage(bodyMessage);
      if (sanitizedBody) {
        return sanitizedBody;
      }
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
      const sanitized = sanitizeUserMessage(error.message);
      if (sanitized) {
        return sanitized;
      }
    }
  }

  if (error instanceof Error && error.message.trim()) {
    const fromZod = extractZodIssueUserMessage(error.message);
    if (fromZod) {
      return fromZod;
    }
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
