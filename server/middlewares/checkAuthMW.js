import { UserModel } from "../models/index.js";
import {
  clearAuthCookie,
  clearRefreshCookie,
  getAuthTokenFromRequest,
} from "../utils/authCookie.js";
import { verifyAccessToken } from "../services/auth/authTokens.js";
import { errorRes } from "../services/http/index.js";

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

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function attachUserIdFromAccessToken(req, res) {
  const token = getAuthTokenFromRequest(req);
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
  return null;
}

export const checkAuthMW = async (req, res, next) => {
  const token = getAuthTokenFromRequest(req);

  if (!token) {
    return errorRes(res, 401, "Не авторизован, токен не найден");
  }

  try {
    const errorResponse = await attachUserIdFromAccessToken(req, res);
    if (errorResponse) {
      return errorResponse;
    }
    return next();
  } catch {
    return errorRes(res, 401, "Не авторизован");
  }
};

/** GET /auth/me: без cookie — гость; просроченный access — 401; битый JWT — очистка cookie и гость. */
export const checkAuthMeMW = async (req, res, next) => {
  const token = getAuthTokenFromRequest(req);

  if (!token) {
    return next();
  }

  try {
    const errorResponse = await attachUserIdFromAccessToken(req, res);
    if (errorResponse) {
      return errorResponse;
    }
    return next();
  } catch (error) {
    if (error?.name === "TokenExpiredError") {
      return errorRes(res, 401, "Не авторизован");
    }

    clearAuthSessionCookies(res);
    return next();
  }
};

export { BLOCKED_ACCOUNT_MESSAGE, DISABLED_ACCOUNT_MESSAGE };
