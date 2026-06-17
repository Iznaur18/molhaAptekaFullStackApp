/** @returns {boolean} */
export function isClientSentryEnabled() {
  return Boolean(import.meta.env.VITE_SENTRY_DSN?.trim());
}
