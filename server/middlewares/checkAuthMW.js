import { UserModel } from "../models/index.js";
import {
  clearAuthCookie,
  clearRefreshCookie,
  getAuthTokenFromRequest,
} from "../utils/authCookie.js";
import { verifyAccessToken } from "../utils/authTokens.js";
import { errorRes } from "../utils/index.js";

const BLOCKED_ACCOUNT_MESSAGE = "Аккаунт заблокирован";
const DISABLED_ACCOUNT_MESSAGE = "Аккаунт отключён администратором";

/**
 * @param {import('express').Response} res
 */
function clearAuthSessionCookies(res) {
  clearAuthCookie(res);
  clearRefreshCookie(res);
}

/**
 * @param {import('express').Response} res
 * @param {{ isBlockedUser?: boolean; isActiveUser?: boolean }} user
 */
function rejectInactiveAccount(res, user) {
  clearAuthSessionCookies(res);
  if (user.isBlockedUser) {
    return errorRes(res, 403, BLOCKED_ACCOUNT_MESSAGE);
  }
  if (user.isActiveUser === false) {
    return errorRes(res, 403, DISABLED_ACCOUNT_MESSAGE);
  }
  return null;
}

export const checkAuthMW = async (req, res, next) => {
  const token = getAuthTokenFromRequest(req);

  if (!token) {
    return errorRes(res, 401, "Не авторизован, токен не найден");
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await UserModel.findById(decoded._id)
      .select("isBlockedUser isActiveUser")
      .lean();

    if (!user) {
      return errorRes(res, 401, "Не авторизован");
    }

    const inactiveResponse = rejectInactiveAccount(res, user);
    if (inactiveResponse) {
      return inactiveResponse;
    }

    req.userId = decoded._id;
    return next();
  } catch {
    return errorRes(res, 401, "Не авторизован");
  }
};

export { BLOCKED_ACCOUNT_MESSAGE, DISABLED_ACCOUNT_MESSAGE };
