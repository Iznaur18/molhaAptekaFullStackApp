import jwt from 'jsonwebtoken';
import { getAuthTokenFromRequest } from '../utils/authCookie.js';
import { errorRes } from '../utils/index.js';

export const checkAuthMW = (req, res, next) => {
    const token = getAuthTokenFromRequest(req);

    if (!token) {
        return errorRes(res, 401, 'Не авторизован, токен не найден');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded._id;
        next();
    } catch {
        return errorRes(res, 401, 'Не авторизован');
    }
};