import bcrypt from 'bcrypt';
import { UserModel } from '../models/index.js';
import { sendUserWithToken, errorRes, successRes } from '../utils/index.js';
import { USER_DATA } from '../constants/constants.js';

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

/** Получение данных текущего пользователя. GET /auth/me (требует Authorization: Bearer <token>) */
export const userMeController = async (req, res) => {
    try {
        // 1. id текущего пользователя из auth middleware (JWT)
        const userIdClient = req.userId;

        if (!userIdClient) {
            return errorRes(res, 401, 'Вы не авторизованы');
        }

        // 2. Ищем пользователя в БД по id
        const userIdServer = await UserModel.findById(userIdClient)
            .select(USER_DATA) // Клиент получит всё что в select()
            .lean();

        if (!userIdServer) {
            return errorRes(res, 404, 'Пользователь не найден');
        }

        return successRes(res, { user: userIdServer });
        
    } catch (error) {
        console.error('userMe error:', error);
        return errorRes(res, 500, error.message || 'Ошибка при получении своих данных');
    }
};

/** Получение профиля другого пользователя по id. GET /user/:userId (публичный — без авторизации) */
export const userGetProfileController = async (req, res) => {
    try {
        const { userIdClient } = req.params; // id юзера из URL

        if (!userIdClient) {
            return errorRes(res, 400, 'ID пользователя обязателен');
        }

        const userIdServer = await UserModel.findById(userIdClient)
            .select(USER_DATA)
            .lean();

        if (!userIdServer) {
            return errorRes(res, 404, 'Пользователь не найден');
        }

        return successRes(res, { user: userIdServer });
        
    } catch (error) {
        console.error('userGetProfile error:', error);
        return errorRes(res, 500, error.message || 'Ошибка при получении профиля');
    }
};