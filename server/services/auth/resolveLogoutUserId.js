import {
  getAuthTokenFromRequest,
  getRefreshTokenFromRequest,
} from "../../utils/authCookie.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";
import { verifyAccessToken, verifyRefreshToken } from "./authTokens.js";
import { isJwtAuthFailure } from "./isJwtAuthFailure.js";

/**
 * Протухший или чужой токен при выходе — штатно: выходим без userId.
 * Остальные ошибки тоже не мешают выходу, но пишутся в журнал.
 *
 * @param {unknown} error
 * @param {string} tokenKind
 */
function noteUnexpectedTokenError(error, tokenKind) {
  if (isJwtAuthFailure(error)) {
    return;
  }
  logServerEvent("warn", {
    event: "auth.logout_token_check_failed",
    tokenKind,
    ...formatLogError(error),
  });
}

/**
 * @param {import('express').Request} req
 * @returns {string | null}
 */
export function resolveLogoutUserId(req) {
  try {
    const accessToken = getAuthTokenFromRequest(req);
    if (accessToken) {
      const decoded = verifyAccessToken(accessToken);
      if (decoded?._id) {
        return String(decoded._id);
      }
    }
  } catch (error) {
    noteUnexpectedTokenError(error, "access");
  }

  try {
    const refreshToken = getRefreshTokenFromRequest(req);
    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded?._id) {
        return String(decoded._id);
      }
    }
  } catch (error) {
    noteUnexpectedTokenError(error, "refresh");
  }

  return null;
}
