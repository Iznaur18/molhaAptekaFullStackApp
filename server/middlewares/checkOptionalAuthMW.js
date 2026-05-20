import jwt from 'jsonwebtoken';

/** Кладёт `req.userId`, если передан валидный Bearer; иначе идёт дальше без ошибки. */
export const checkOptionalAuthMW = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.replace('Bearer ', '')
        : '';

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
