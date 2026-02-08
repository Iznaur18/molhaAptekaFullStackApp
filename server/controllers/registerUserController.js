import bcrypt from 'bcrypt';
import { UserModel } from '../models/index.js';
import { sendUserWithToken, errorRes } from '../utils/index.js';
import { DEFAULT_AVATAR_URL } from '../constants/constants.js';

/** Регистрация только по email + пароль. POST /auth/register */
export const registerUserController = async (req, res) => { // обработчик регистрации пользователя по email + пароль
    try {
        const { email, password, userName, phoneNumber, avatarUrl } = req.body; // извлекаем данные из тела запроса

        //TODO: (Разобраться) Проверка на существование пользователя с таким email или userName или userPhoneNumber
        const orConditions = [{ email }, { userName }]; // ищем пользователя по email или userName
        if (phoneNumber != null && phoneNumber !== '') orConditions.push({ userPhoneNumber: phoneNumber }); // если phoneNumber не пустая строка, в orConditions добавляем userPhoneNumber
        const exists = await UserModel.findOne({ $or: orConditions }); // ищем пользователя по email или userName или userPhoneNumber
        if (exists) { // если пользователь с таким email или userName или userPhoneNumber уже существует, возвращаем ошибку
            return errorRes(res, 400, 'Пользователь с таким email или userName или userPhoneNumber уже существует');
        }

        const salt = await bcrypt.genSalt(10); // генерируем соль для хеширования пароля
        const passwordHash = await bcrypt.hash(password, salt); // хешируем пароль

        const doc = new UserModel({ // создаем новый пользователя в базе данных
            email, // email передаем в документ
            passwordHash, // passwordHash передаем в документ
            userName: userName || undefined, // если userName не передан в запросе, подставляем undefined
            userPhoneNumber: (phoneNumber != null && phoneNumber !== '') ? String(phoneNumber).trim() : undefined, // если phoneNumber не передан в запросе, подставляем undefined
            userAvatarUrl: avatarUrl ?? DEFAULT_AVATAR_URL, // если avatarUrl не передан в запросе, подставляем значение по умолчанию
        });

        const user = await doc.save(); // сохраняем пользователя в базу данных

        return sendUserWithToken(user, res); // отправляем пользователя с токеном
    } catch (error) {
        console.error(error);
        return errorRes(res, 500, 'Ошибка при регистрации пользователя');
    }
};
