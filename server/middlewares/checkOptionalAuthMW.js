import { getAuthTokenFromRequest } from "../utils/authCookie.js";
import { verifyAccessToken } from "../services/auth/authTokens.js";

/** Кладёт `req.userId`, если передан валидный access JWT; иначе идёт дальше без ошибки. */
export const checkOptionalAuthMW = (req, res, next) => {
  const token = getAuthTokenFromRequest(req);

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    req.userId = decoded._id;
  } catch {
    // публичный каталог: невалидный токен игнорируем
  }

  return next();
};
