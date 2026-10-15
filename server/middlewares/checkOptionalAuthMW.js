import { UserModel } from "../models/index.js";
import { getAuthTokenFromRequest } from "../utils/authCookie.js";
import { verifyAccessToken } from "../services/auth/authTokens.js";
import { isJwtAuthFailure } from "../services/auth/isJwtAuthFailure.js";
import { isRefreshTokenVersionValid } from "../services/auth/userAuthTokenVersion.js";
import { formatLogError, logServerEvent } from "../utils/logServerEvent.js";

/** Кладёт `req.userId`, если передан валидный (не отозванный) access JWT; иначе идёт дальше без ошибки. */
export const checkOptionalAuthMW = async (req, res, next) => {
  const token = getAuthTokenFromRequest(req);

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await UserModel.findById(decoded._id)
      .select("+authTokenVersion isBlockedUser isActiveUser")
      .lean();

    if (
      user &&
      isRefreshTokenVersionValid(decoded.tv, user) &&
      !user.isBlockedUser &&
      user.isActiveUser !== false
    ) {
      req.userId = decoded._id;
    }
  } catch (error) {
    // Публичный каталог: невалидный или протухший токен — штатно, идём гостем.
    // Сбой базы и прочее — тоже гостем, но с записью в журнал.
    if (!isJwtAuthFailure(error)) {
      logServerEvent("warn", {
        event: "auth.optional_auth_failed",
        requestId: req.requestId,
        ...formatLogError(error),
      });
    }
  }

  return next();
};
