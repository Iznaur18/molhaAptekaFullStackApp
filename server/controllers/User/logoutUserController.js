import { resolveLogoutUserId } from "../../services/auth/resolveLogoutUserId.js";
import { bumpUserAuthTokenVersion } from "../../services/auth/userAuthTokenVersion.js";
import { clearAuthCookie, clearRefreshCookie } from "../../utils/authCookie.js";
import { successRes } from "../../services/http/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

/** Выход: очистка cookie (web) + опциональный refreshToken в body (mobile). POST /auth/logout */
export const logoutUserController = async (req, res) => {
  const userId = resolveLogoutUserId(req);
  if (userId) {
    try {
      await bumpUserAuthTokenVersion(userId);
    } catch (error) {
      logServerEvent("error", {
        event: "logout_bumpuserauthtokenversion",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  clearAuthCookie(res);
  clearRefreshCookie(res);
  return successRes(res, { message: "Вы вышли из аккаунта" });
};
