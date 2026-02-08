import jwt from 'jsonwebtoken';
import { errorRes } from '../utils/index.js';

// Мидлвар для проверки JWT-токена в заголовке Authorization
export const checkAuthMW = (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    // Ожидаем формат 'Bearer <token>'
    const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : ''; // извлекаем токен из заголовка Authorization

    if (!token) {
        // Нет токена — не авторизован
        return errorRes(res, 401, 'Не авторизован, токен не найден');
    }

    try {
        // Проверяем токен — если невалиден, будет ошибка
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded._id; // добавляем id пользователя в req
        next(); // передаем управление следующему middleware или контроллеру
    } catch (error) {
        // Невалидный токен, не авторизован
        return errorRes(res, 401, 'Не авторизован');
    }
}