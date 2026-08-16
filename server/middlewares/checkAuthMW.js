import { UserModel } from "../models/index.js";
import {
  clearAuthCookie,
  clearRefreshCookie,
  getAuthTokenFromRequest,
} from "../utils/authCookie.js";
import { verifyAccessToken } from "../services/auth/authTokens.js";
import { isRefreshTokenVersionValid } from "../services/auth/userAuthTokenVersion.js";
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
  // Чистим сессию ТОЛЬКО когда реально отклоняем (блокировка/отключение).
  // Раньше clearAuthSessionCookies стоял безусловно в начале — и гасил куки
  // у любого валидного активного пользователя на КАЖДОМ авторизованном
  // запросе: первый ответ приходил с данными, но кука стиралась → следующий
  // запрос уже гость → «выкидывает после входа».
  if (user.isBlockedUser) {
    clearAuthSessionCookies(res);
    return errorRes(res, 403, BLOCKED_ACCOUNT_MESSAGE);
  }
  if (user.isActiveUser === false) {
    clearAuthSessionCookies(res);
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
    .select("+authTokenVersion isBlockedUser isActiveUser")
    .lean();

  if (!user) {
    return errorRes(res, 401, "Не авторизован");
  }

  // Отзыв сессии (logout / ротация refresh) должен гасить и access-токен.
  // Токены, выпущенные до появления `tv`, невалидны — клиент прозрачно
  // переполучит пару через /auth/refresh по действующему refresh-токену.
  if (!isRefreshTokenVersionValid(decoded.tv, user)) {
    clearAuthSessionCookies(res);
    return errorRes(res, 401, "Сессия истекла");
  }

  const inactiveResponse = rejectInactiveAccount(res, user);
  if (inactiveResponse) {
    return inactiveResponse;
  }

  req.userId = decoded._id;
  return null;
}

/**
 * @param {unknown} error
 */
function isJwtAuthFailure(error) {
  const name = error && typeof error === "object" ? error.name : "";
  const message = error instanceof Error ? error.message : "";
  return (
    name === "JsonWebTokenError" ||
    name === "TokenExpiredError" ||
    name === "NotBeforeError" ||
    message === "INVALID_TOKEN_TYPE"
  );
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
  } catch (error) {
    if (isJwtAuthFailure(error)) {
      return errorRes(res, 401, "Не авторизован");
    }
    return next(error);
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

    if (isJwtAuthFailure(error)) {
      clearAuthSessionCookies(res);
      return next();
    }

    return next(error);
  }
};

export { BLOCKED_ACCOUNT_MESSAGE, DISABLED_ACCOUNT_MESSAGE };
