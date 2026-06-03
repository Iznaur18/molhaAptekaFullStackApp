import jwt from 'jsonwebtoken';

import { getAuthTokenFromRequest } from '../utils/authCookie.js';

/** Кладёт `req.userId`, если передан валидный JWT; иначе идёт дальше без ошибки. */
export const checkOptionalAuthMW = (req, res, next) => {
    const token = getAuthTokenFromRequest(req);

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded._id;
    } catch {
        // публичный каталог: невалидный токен игнорируем
    }

    return next();
};
