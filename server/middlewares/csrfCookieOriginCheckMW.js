import {
  AUTH_CLIENT_HEADER,
  AUTH_CLIENT_MOBILE,
} from "../constants/authClientConstants.js";
import {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from "../constants/authCookieConstants.js";
import { errorRes } from "../services/http/index.js";
import { isDevTrustedBrowserOrigin } from "../utils/isDevTrustedBrowserOrigin.js";
import { resolveRequestBrowserOrigin } from "../utils/resolveRequestBrowserOrigin.js";
import { parseFrontendOrigins } from "../utils/resolveFrontendOrigin.js";

const UNSAFE_HTTP_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

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
 * @param {import('express').Request} req
 */
function resolveAuthClient(req) {
  return String(req.get(AUTH_CLIENT_HEADER) ?? "")
    .trim()
    .toLowerCase();
}

/**
 * RN/Expo часто шлёт cookie (withCredentials) без Origin или с exp://.
 * Браузерный CSRF всегда даёт http(s) Origin — его по-прежнему режем allowlist'ом.
 *
 * @param {string | null} origin
 */
function isNonBrowserOrigin(origin) {
  if (!origin || origin === "null") {
    return true;
  }
  try {
    const protocol = new URL(origin).protocol;
    return protocol !== "http:" && protocol !== "https:";
  } catch {
    return true;
  }
}

/**
 * CSRF для cookie-auth мутаций: Origin/Referer должен быть в FRONTEND_URL.
 * Non-prod: дополнительно loopback + private LAN (Vite с телефона по 192.168.x.x).
 * Bearer mobile (`X-Auth-Client: mobile`) без browser Origin — пропускаем.
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

  const isProduction = process.env.NODE_ENV === "production";
  const allowedOrigins = parseFrontendOrigins(process.env.FRONTEND_URL);
  if (allowedOrigins.length === 0) {
    if (isProduction) {
      return errorRes(res, 403, "Запрос отклонён (origin)");
    }
    return next();
  }

  const requestOrigin = resolveRequestBrowserOrigin(req);
  const authClient = resolveAuthClient(req);

  if (authClient === AUTH_CLIENT_MOBILE && isNonBrowserOrigin(requestOrigin)) {
    return next();
  }

  if (!requestOrigin || requestOrigin === "null") {
    return errorRes(res, 403, "Запрос отклонён (origin)");
  }

  if (allowedOrigins.includes(requestOrigin)) {
    return next();
  }

  // FRONTEND_URL часто только 127.0.0.1:5173 — LAN IP иначе ловит 403 на /cart, /view.
  if (!isProduction && isDevTrustedBrowserOrigin(requestOrigin)) {
    return next();
  }

  return errorRes(res, 403, "Запрос отклонён (origin)");
}
