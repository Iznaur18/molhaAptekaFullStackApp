/**
 * Ошибка именно токена (подпись, срок, тип), а не сбой сервера.
 *
 * Такие ошибки — штатная ситуация: протухшая кука, чужой токен. Их можно
 * пропускать молча; всё остальное (например, недоступная база) — нет.
 *
 * @param {unknown} error
 */
export function isJwtAuthFailure(error) {
  const name = error && typeof error === "object" ? error.name : "";
  const message = error instanceof Error ? error.message : "";
  return (
    name === "JsonWebTokenError" ||
    name === "TokenExpiredError" ||
    name === "NotBeforeError" ||
    message === "INVALID_TOKEN_TYPE"
  );
}
