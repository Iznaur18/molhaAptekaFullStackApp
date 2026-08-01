import {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from "../constants/authCookieConstants.js";
import { errorRes } from "../services/http/index.js";
import { parseFrontendOrigins } from "../utils/resolveFrontendOrigin.js";

const UNSAFE_HTTP_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * @param {import('express').Request} req
 * @returns {string | null}
 */
function resolveRequestOrigin(req) {
  const origin = req.get("origin");
  if (origin) {
    return origin;
  }

  const referer = req.get("referer");
  if (!referer) {
    return null;
  }

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

/**
 * Cookie-сессия: access и/или refresh (после expiry access refresh ещё жив).
 *
 * @param {import('express').Request} req
 */
function hasCookieAuthSession(req) {
  const accessCookie = req.cookies?.[AUTH_COOKIE_NAME];
  const refreshCookie = req.cookies?.[REFRESH_COOKIE_NAME];
  return Boolean(accessCookie || refreshCookie);
}

/**
 * CSRF для cookie-auth мутаций: Origin/Referer должен быть в FRONTEND_URL.
 * Bearer-only (mobile) — без cookie — пропускаем.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function csrfCookieOriginCheckMW(req, res, next) {
  if (process.env.NODE_ENV === "test") {
    return next();
  }

  if (!UNSAFE_HTTP_METHODS.has(req.method)) {
    return next();
  }

  if (!hasCookieAuthSession(req)) {
    return next();
  }

  const allowedOrigins = parseFrontendOrigins(process.env.FRONTEND_URL);
  if (allowedOrigins.length === 0) {
    if (process.env.NODE_ENV === "production") {
      return errorRes(res, 403, "Запрос отклонён (origin)");
    }
    return next();
  }

  const requestOrigin = resolveRequestOrigin(req);
  if (!requestOrigin || !allowedOrigins.includes(requestOrigin)) {
    return errorRes(res, 403, "Запрос отклонён (origin)");
  }

  return next();
}
