import * as Sentry from "@sentry/react";

/**
 * @param {{ children: import('react').ReactNode; fallback: import('react').ReactNode }} props
 */
export function SentryAppErrorBoundary({ children, fallback }) {
  return <Sentry.ErrorBoundary fallback={fallback}>{children}</Sentry.ErrorBoundary>;
}
