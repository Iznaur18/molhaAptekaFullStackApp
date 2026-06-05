import { getAuthTokenFromRequest } from "../utils/authCookie.js";
import { verifyAccessToken } from "../utils/authTokens.js";
import { errorRes } from "../utils/index.js";

export const checkAuthMW = (req, res, next) => {
  const token = getAuthTokenFromRequest(req);

  if (!token) {
    return errorRes(res, 401, "Не авторизован, токен не найден");
  }

  try {
    const decoded = verifyAccessToken(token);
    req.userId = decoded._id;
    next();
  } catch {
    return errorRes(res, 401, "Не авторизован");
  }
};
