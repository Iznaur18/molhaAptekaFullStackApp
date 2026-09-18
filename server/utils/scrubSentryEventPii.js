const SENSITIVE_HEADER_KEYS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  // IP клиента за nginx — персональные данные, за границу не отправляем.
  "x-forwarded-for",
  "x-real-ip",
  "cf-connecting-ip",
]);

/**
 * Убирает cookie/JWT и IP-адрес пользователя из события Sentry перед отправкой:
 * Sentry хранит данные за границей (152-ФЗ).
 * @param {import('@sentry/node').ErrorEvent} event
 * @returns {import('@sentry/node').ErrorEvent | null}
 */
export function scrubSentryEventPii(event) {
  /** @type {import('@sentry/node').ErrorEvent} */
  let scrubbed = event;

  if (event.user) {
    const { ip_address: _ipAddress, ...user } = event.user;
    scrubbed = { ...scrubbed, user };
  }

  const request = event.request;
  if (!request) {
    return scrubbed;
  }

  const headers = { ...(request.headers ?? {}) };
  for (const key of Object.keys(headers)) {
    if (SENSITIVE_HEADER_KEYS.has(key.toLowerCase())) {
      headers[key] = "[Filtered]";
    }
  }

  const env = request.env ? { ...request.env } : undefined;
  if (env) {
    delete env.REMOTE_ADDR;
  }

  return {
    ...scrubbed,
    request: {
      ...request,
      headers,
      env,
      cookies: undefined,
      data: undefined,
    },
  };
}
