const SENSITIVE_HEADER_KEYS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
]);

/**
 * Убирает cookie/JWT из события Sentry перед отправкой.
 * @param {import('@sentry/node').ErrorEvent} event
 * @returns {import('@sentry/node').ErrorEvent | null}
 */
export function scrubSentryEventPii(event) {
  const request = event.request;
  if (!request?.headers) {
    return event;
  }

  const headers = { ...request.headers };
  for (const key of Object.keys(headers)) {
    if (SENSITIVE_HEADER_KEYS.has(key.toLowerCase())) {
      headers[key] = "[Filtered]";
    }
  }

  return {
    ...event,
    request: {
      ...request,
      headers,
      cookies: undefined,
      data: undefined,
    },
  };
}
