import { resolveLogoutUserId } from "../../services/auth/resolveLogoutUserId.js";
import { bumpUserAuthTokenVersion } from "../../services/auth/userAuthTokenVersion.js";
import { clearAuthCookie, clearRefreshCookie } from "../../utils/authCookie.js";
import { successRes } from "../../services/http/index.js";
import {
  logSecurityEvent,
  logSecurityFailure,
  securityRequestFields,
} from "../../services/auth/logSecurityEvent.js";

/** Выход: очистка cookie (web) + опциональный refreshToken в body (mobile). POST /auth/logout */
export const logoutUserController = async (req, res) => {
  const userId = resolveLogoutUserId(req);
  if (userId) {
    try {
      await bumpUserAuthTokenVersion(userId);
    } catch (error) {
      logSecurityFailure(
        "logout_bump_token",
        { ...securityRequestFields(req), userId: String(userId) },
        error,
      );
    }
  }

  clearAuthCookie(res);
  clearRefreshCookie(res);
  logSecurityEvent("info", "logout", {
    ...securityRequestFields(req),
    userId: userId ? String(userId) : null,
  });
  return successRes(res, { message: "Вы вышли из аккаунта" });
};
