import jwt from 'jsonwebtoken';
import { successRes } from './successRes.js';

const TOKEN_OPTIONS = { expiresIn: '30d' };

/**
 * Унифицированный ответ авторизации: { success: true, data: { ...userData, token } }.
 * @param {object} user - документ пользователя (mongoose)
 * @param {object} res - объект response Express
 */
export function sendUserWithToken(user, res) { // функция отправляет пользователя с токеном
    const { passwordHash, ...userData } = user._doc; // извлекаем все поля из user._doc, кроме passwordHash
    const token = jwt.sign( // генерируем токен для пользователя
        { _id: user._id }, // поле _id пользователя, полученный из базы данных
        process.env.JWT_SECRET, // секретный ключ для подписи токена
        TOKEN_OPTIONS // время действия токена
    );
    return successRes(res, { ...userData, token }); // отправляем пользователя с токеном
    
}
