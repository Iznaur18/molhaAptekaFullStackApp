import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN?.trim();

/**
 * @returns {boolean}
 */
export function isClientSentryEnabled() {
  return Boolean(dsn);
}

/**
 * @returns {boolean}
 */
export function initClientSentry() {
  if (!dsn) {
    return false;
  }

  const tracesSampleRate = Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? "0.1");
  const release = import.meta.env.VITE_GIT_COMMIT_SHA?.trim() || undefined;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release,
    enabled: true,
    integrations: [
      Sentry.browserTracingIntegration({
        tracePropagationTargets: [
          /^\//,
          import.meta.env.VITE_API_URL,
        ].filter(Boolean),
      }),
    ],
    tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 0.1,
    beforeSend(event) {
      if (event.request?.headers) {
        const headers = { ...event.request.headers };
        if (headers.Authorization) {
          headers.Authorization = "[Filtered]";
        }
        if (headers.Cookie) {
          headers.Cookie = "[Filtered]";
        }
        return { ...event, request: { ...event.request, headers } };
      }
      return event;
    },
  });

  return true;
}

export { Sentry };
