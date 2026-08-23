import { resolveRequestBrowserOrigin } from "../utils/resolveRequestBrowserOrigin.js";
import { parseFrontendOrigins } from "../utils/resolveFrontendOrigin.js";

/** Header: mobile / web-dev получают access/refresh в JSON; web prod — только httpOnly cookies. */
export const AUTH_CLIENT_HEADER = "x-auth-client";
export const AUTH_CLIENT_MOBILE = "mobile";
/** Vite DEV + LAN: Bearer в sessionStorage (cookie по IP часто не сохраняются). */
export const AUTH_CLIENT_WEB_DEV = "web-dev";

/**
 * Токены в теле ответа сводят на нет защиту httpOnly-кук: при XSS на origin
 * SPA достаточно дёрнуть `/auth/refresh` с этим заголовком и прочитать
 * refresh-токен. Заголовок задаёт кто угодно, поэтому в проде дополнительно
 * смотрим на Origin:
 *   - `web-dev` в проде не действует вовсе;
 *   - `mobile` не действует, если запрос пришёл из браузера на SPA-origin
 *     (RN `Origin` из списка FRONTEND_URL не шлёт, а XSS в SPA — всегда).
 *
 * @param {import('express').Request | null | undefined} req
 */
export function shouldIncludeAuthTokensInBody(req) {
  const client = String(req?.get?.(AUTH_CLIENT_HEADER) ?? "")
    .trim()
    .toLowerCase();

  if (client !== AUTH_CLIENT_MOBILE && client !== AUTH_CLIENT_WEB_DEV) {
    return false;
  }

  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  if (client === AUTH_CLIENT_WEB_DEV) {
    return false;
  }

  const origin = resolveRequestBrowserOrigin(req);
  if (origin && parseFrontendOrigins().includes(origin)) {
    return false;
  }

  return true;
}
