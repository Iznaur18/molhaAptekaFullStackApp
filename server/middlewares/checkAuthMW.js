import jwt from 'jsonwebtoken';

// Мидлвар для проверки JWT-токена в заголовке Authorization
export const checkAuthMW = (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    // Ожидаем формат 'Bearer <token>'
    const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : '';

    if (!token) {
        // Нет токена — не авторизован
        return res.status(401).json({
            message: 'Не авторизован, токен не найден'
        });
    }

    try {
        // Проверяем токен — если невалиден, будет ошибка
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded._id; // добавляем id пользователя в req
        next();
    } catch (error) {
        // Невалидный токен, не авторизован
        return res.status(401).json({
            message: 'Не авторизован'
        });
    }
}