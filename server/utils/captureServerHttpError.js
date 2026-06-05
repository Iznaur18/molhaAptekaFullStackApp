import * as Sentry from "@sentry/node";

import { isServerSentryEnabled } from "./initServerSentry.js";
import { resolveHttpErrorStatus } from "./resolveHttpErrorStatus.js";

/**
 * 5xx → Sentry (с requestId, без body/cookies).
 * @param {Error} err
 * @param {import('express').Request} req
 */
export function captureServerHttpError(err, req) {
  if (!isServerSentryEnabled()) {
    return;
  }

  const statusCode = resolveHttpErrorStatus(err);
  if (statusCode < 500) {
    return;
  }

  Sentry.withScope((scope) => {
    scope.setTag("requestId", req.requestId ?? "unknown");
    scope.setTag("statusCode", String(statusCode));
    scope.setContext("http", {
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode,
    });
    Sentry.captureException(err);
  });
}
