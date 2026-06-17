import {
  getAuthTokenFromRequest,
  getRefreshTokenFromRequest,
} from "../../utils/authCookie.js";
import { verifyAccessToken, verifyRefreshToken } from "./authTokens.js";

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
  } catch {
    // ignore invalid access token on logout
  }

  try {
    const refreshToken = req.body?.refreshToken ?? getRefreshTokenFromRequest(req);
    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded?._id) {
        return String(decoded._id);
      }
    }
  } catch {
    // ignore invalid refresh token on logout
  }

  return null;
}
