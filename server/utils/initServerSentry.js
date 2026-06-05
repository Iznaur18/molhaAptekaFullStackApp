import * as Sentry from "@sentry/node";

import { resolveGitCommitSha } from "./resolveGitCommitSha.js";
import { scrubSentryEventPii } from "./scrubSentryEventPii.js";

/**
 * @returns {boolean}
 */
export function isServerSentryEnabled() {
  return Boolean(process.env.SENTRY_DSN?.trim());
}

/**
 * Инициализация Sentry (no-op без SENTRY_DSN).
 * @returns {boolean}
 */
export function initServerSentry() {
  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn) {
    return false;
  }

  const tracesSampleRate = Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1");

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    release: resolveGitCommitSha() ?? undefined,
    tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 0.1,
    beforeSend: scrubSentryEventPii,
  });

  return true;
}
