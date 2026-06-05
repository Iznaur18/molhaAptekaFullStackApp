/**
 * @param {unknown} error
 */
export function isAuthSessionError(error) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("авторизован") ||
    message.includes("токен") ||
    message.includes("refresh token")
  );
}
