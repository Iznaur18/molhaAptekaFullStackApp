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
    if (req) {
      scope.setTag("requestId", req.requestId ?? "unknown");
      scope.setContext("http", {
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode,
      });
    } else {
      scope.setTag("source", "process");
    }
    scope.setTag("statusCode", String(statusCode));
    Sentry.captureException(err);
  });
}
