/** Header: mobile / web-dev получают access/refresh в JSON; web prod — только httpOnly cookies. */
export const AUTH_CLIENT_HEADER = "x-auth-client";
export const AUTH_CLIENT_MOBILE = "mobile";
/** Vite DEV + LAN: Bearer в sessionStorage (cookie по IP часто не сохраняются). */
export const AUTH_CLIENT_WEB_DEV = "web-dev";

/**
 * @param {import('express').Request | null | undefined} req
 */
export function shouldIncludeAuthTokensInBody(req) {
  const client = String(req?.get?.(AUTH_CLIENT_HEADER) ?? "")
    .trim()
    .toLowerCase();
  return client === AUTH_CLIENT_MOBILE || client === AUTH_CLIENT_WEB_DEV;
}
