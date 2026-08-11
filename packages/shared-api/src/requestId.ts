/** Совпадает с `server/constants/requestLogConstants.js`. */
export const REQUEST_ID_HEADER = "X-Request-Id";

export const REQUEST_ID_MIN_LENGTH = 8;
export const REQUEST_ID_MAX_LENGTH = 64;

const REQUEST_ID_PATTERN = /^[a-zA-Z0-9._-]+$/;

/**
 * Клиентский id: UUID или fallback (LAN / без secure context — без crypto.randomUUID).
 * @returns {string}
 */
export function generateClientRequestId(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `req_${time}_${rand}`;
}

/**
 * @param {string | undefined | null} raw
 * @returns {string | null}
 */
export function normalizeClientRequestId(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") {
    return null;
  }
  const trimmed = raw.trim();
  if (
    trimmed.length < REQUEST_ID_MIN_LENGTH ||
    trimmed.length > REQUEST_ID_MAX_LENGTH ||
    !REQUEST_ID_PATTERN.test(trimmed)
  ) {
    return null;
  }
  return trimmed;
}

/**
 * @param {unknown} headers
 * @param {string} name
 * @returns {string | null}
 */
export function readHeaderIgnoreCase(headers: unknown, name: string): string | null {
  if (!headers || typeof headers !== "object") {
    return null;
  }

  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers as Record<string, unknown>)) {
    if (key.toLowerCase() !== target) {
      continue;
    }
    if (typeof value === "string") {
      return value;
    }
    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0];
    }
  }
  return null;
}

type RequestIdCarrier = {
  requestId?: string;
  config?: {
    _requestId?: string;
    headers?: unknown;
    url?: string;
  };
  response?: {
    status?: number;
    headers?: unknown;
    data?: { requestId?: unknown };
  };
};

/**
 * @param {unknown} error
 * @returns {string | null}
 */
export function getRequestIdFromAxiosError(error: unknown): string | null {
  const err = error as RequestIdCarrier | null;
  if (!err || typeof err !== "object") {
    return null;
  }

  const fromProp = normalizeClientRequestId(err.requestId);
  if (fromProp) {
    return fromProp;
  }

  const fromConfig = normalizeClientRequestId(err.config?._requestId);
  if (fromConfig) {
    return fromConfig;
  }

  const fromRequestHeader = normalizeClientRequestId(
    readHeaderIgnoreCase(err.config?.headers, REQUEST_ID_HEADER),
  );
  if (fromRequestHeader) {
    return fromRequestHeader;
  }

  const fromResponseHeader = normalizeClientRequestId(
    readHeaderIgnoreCase(err.response?.headers, REQUEST_ID_HEADER),
  );
  if (fromResponseHeader) {
    return fromResponseHeader;
  }

  const bodyId = err.response?.data?.requestId;
  return normalizeClientRequestId(typeof bodyId === "string" ? bodyId : null);
}

const AUTH_MONEY_PATH_MARKERS = [
  "/auth/",
  "/order",
  "/loyalty",
  "/premium",
  "/installment",
  "/referral",
  "/affiliate",
  "/raffle",
  "/user/me/balance",
  "/user/me/premium",
];

/**
 * 5xx или auth/money path — достойны Sentry breadcrumb с requestId.
 * @param {string} url
 * @param {number | undefined} status
 */
export function isCorrelationWorthyApiFailure(
  url: string,
  status: number | undefined,
): boolean {
  if (typeof status === "number" && status >= 500) {
    return true;
  }
  const path = String(url ?? "");
  return AUTH_MONEY_PATH_MARKERS.some((marker) => path.includes(marker));
}
