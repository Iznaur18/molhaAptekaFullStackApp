import { isClientSentryEnabled } from "./clientSentryEnv.js";

/**
 * @returns {Promise<boolean>}
 */
export async function initClientSentry() {
  if (!isClientSentryEnabled()) {
    return false;
  }

  const Sentry = await import("@sentry/react");

  const tracesSampleRate = Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? "0.1");
  const release = import.meta.env.VITE_GIT_COMMIT_SHA?.trim() || undefined;

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN?.trim(),
    environment: import.meta.env.MODE,
    release,
    enabled: true,
    integrations: [
      Sentry.browserTracingIntegration({
        tracePropagationTargets: [/^\//, import.meta.env.VITE_API_URL].filter(Boolean),
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
