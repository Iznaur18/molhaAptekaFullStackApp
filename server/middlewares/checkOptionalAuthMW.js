import { UserModel } from "../models/index.js";
import { getAuthTokenFromRequest } from "../utils/authCookie.js";
import { verifyAccessToken } from "../services/auth/authTokens.js";
import { isRefreshTokenVersionValid } from "../services/auth/userAuthTokenVersion.js";

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
  } catch {
    // публичный каталог: невалидный / отозванный токен игнорируем
  }

  return next();
};
