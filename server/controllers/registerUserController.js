import bcrypt from 'bcrypt';
import { UserModel } from '../models/index.js';
import { sendUserWithToken } from '../utils/index.js';

/** Регистрация только по email + пароль. POST /auth/register */
export const registerUserController = async (req, res) => { // обработчик регистрации пользователя по email + пароль
    try {
        const { email, password, userName, phoneNumber, avatarUrl, address } = req.body; // извлекаем данные из тела запроса

        // Проверка на существование пользователя с таким email или userName
        const exists = await UserModel.findOne({ 
            $or: [{ email }, { userName }] // ищем пользователя по email или userName
        });
        if (exists) { // если пользователь с таким email или userName уже существует, возвращаем ошибку
            return res.status(400).json({ message: 'Пользователь с таким email или username уже существует' });
        }

        const salt = await bcrypt.genSalt(10); // генерируем соль для хеширования пароля
        const passwordHash = await bcrypt.hash(password, salt); // хешируем пароль

        const doc = new UserModel({ // создаем новый пользователя в базе данных
            email, // email передаем в документ
            passwordHash, // passwordHash передаем в документ
            userName: userName || undefined, // если userName не передан в запросе, подставляем undefined
            userPhoneNumber: (phoneNumber !== undefined && phoneNumber !== '') ? phoneNumber : undefined, // если phoneNumber не передан в запросе, подставляем undefined
            userAvatarUrl: avatarUrl ?? 'https://i.pinimg.com/originals/c9/31/92/c93192b782081d4d1d70b03a3c1cf011.jpg', // если avatarUrl не передан в запросе, подставляем https://i.pinimg.com/originals/c9/31/92/c93192b782081d4d1d70b03a3c1cf011.jpg
            userAddress: address ?? undefined, // если address не передан в запросе, подставляем undefined
        });

        const user = await doc.save(); // сохраняем пользователя в базу данных

        return sendUserWithToken(user, res); // отправляем пользователя с токеном
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Ошибка при регистрации пользователя' });
    }
};
