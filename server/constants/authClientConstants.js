/** Header: mobile получает access/refresh в JSON; web — только httpOnly cookies. */
export const AUTH_CLIENT_HEADER = "x-auth-client";
export const AUTH_CLIENT_MOBILE = "mobile";

/**
 * @param {import('express').Request | null | undefined} req
 */
export function shouldIncludeAuthTokensInBody(req) {
  const client = String(req?.get?.(AUTH_CLIENT_HEADER) ?? "")
    .trim()
    .toLowerCase();
  return client === AUTH_CLIENT_MOBILE;
}
