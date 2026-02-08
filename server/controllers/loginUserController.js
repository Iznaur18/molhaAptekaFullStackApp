import bcrypt from 'bcrypt';
import { UserModel } from '../models/index.js';
import { sendUserWithToken, errorRes } from '../utils/index.js';

/** Вход по email + пароль. POST /auth/login */
export const loginUserController = async (req, res) => { // обработчик входа по email + пароль
    try {
        const { email, password } = req.body; // извлекаем email и пароль из тела запроса

        if (!email || !password) { // если email или пароль не переданы в запросе, возвращаем ошибку
            return errorRes(res, 400, 'Укажите email и пароль');
        }

        const user = await UserModel.findOne({ email }).select('+passwordHash'); // ищем пользователя по email и выбираем поле passwordHash для сравнения пароля с переданным паролем из запроса

        if (!user) { // если пользователь не найден, возвращаем ошибку
            return errorRes(res, 400, 'Неверный email или пароль');
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash); // сравниваем пароль из запроса с паролем из базы данных

        if (!isValidPassword) { // если пароль из запроса не совпадает с паролем из базы данных, возвращаем ошибку
            return errorRes(res, 400, 'Неверный email или пароль');
        }

        return sendUserWithToken(user, res); // отправляем пользователя с токеном вход по email + пароль

    } catch (error) {
        console.error(error);
        return errorRes(res, 500, 'Ошибка при входе'); // если произошла ошибка, возвращаем ошибку
    }
};